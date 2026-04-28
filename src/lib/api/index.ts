import { PlanType, InputMileStoneType } from "@/lib/types/vue-viewmodels";
import _ from "lodash";

type Attributes = { [key: string]: any };

type BackendPayload = {
  className: string;
  id?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  attributes: Attributes;
};

const API_BASE_URL = (
  process.env.VUE_APP_TIMEBARRIER_API_URL || "http://127.0.0.1:3999/api"
).replace(/\/$/, "");
const USER_STORAGE_KEY = "timebarrier.currentUserId";
const DATE_ATTRIBUTE_KEYS = new Set(["startTime", "deadline", "validity"]);

class BackendObject {
  className: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  attributes: Attributes;

  constructor(payload: BackendPayload | string, attributes: Attributes = {}) {
    if (typeof payload === "string") {
      this.className = payload;
      this.attributes = attributes;
    } else {
      this.className = payload.className;
      this.id = payload.id;
      this.createdAt = payload.createdAt ? new Date(payload.createdAt) : undefined;
      this.updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : undefined;
      this.attributes = hydrateAttributes(payload.attributes);
    }
  }

  set(key: string, value: any): this {
    this.attributes[key] = value;
    return this;
  }

  async save(): Promise<this> {
    if (!this.id) {
      throw new Error(`${this.className}.id is undefined`);
    }

    if (this.className === "_User") {
      const updated = await request<BackendUser>(`/users/${encodeURIComponent(this.id)}`, {
        method: "PATCH",
        body: {
          nickName: this.attributes.nickName,
          signature: this.attributes.signature,
          avatarUrl: this.attributes.avatarUrl
        }
      });
      this.apply(updated);
      return this;
    }

    const resource = resourceName(this.className);
    if (!resource) {
      throw new Error(`Unsupported save class: ${this.className}`);
    }

    const updated = await request<BackendObject>(`/${resource}/${encodeURIComponent(this.id)}`, {
      method: "PATCH",
      body: serializeAttributes(this.attributes)
    });
    this.apply(updated);
    return this;
  }

  async destroy(): Promise<void> {
    if (!this.id) {
      throw new Error(`${this.className}.id is undefined`);
    }
    const resource = resourceName(this.className);
    if (!resource) {
      throw new Error(`Unsupported destroy class: ${this.className}`);
    }
    await request<void>(`/${resource}/${encodeURIComponent(this.id)}`, {
      method: "DELETE"
    });
  }

  protected apply(object: BackendObject): void {
    this.id = object.id;
    this.createdAt = object.createdAt;
    this.updatedAt = object.updatedAt;
    this.attributes = object.attributes;
  }
}

class BackendUser extends BackendObject {
  async fetch(): Promise<this> {
    if (!this.id) {
      throw new Error("user.id is undefined");
    }
    const user = await request<BackendUser>(`/users/${encodeURIComponent(this.id)}`);
    this.apply(user);
    return this;
  }
}

let currentUser: BackendUser | null = null;

function resourceName(className: string): string | null {
  const map: { [key: string]: string } = {
    Plan: "plans",
    Ability: "abilities",
    Target: "targets",
    TargetSubject: "target-subjects"
  };
  return map[className] || null;
}

function hasLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function hydrateAttributes(attributes: Attributes): Attributes {
  const result: Attributes = {};
  Object.keys(attributes || {}).forEach(key => {
    const value = hydrate(attributes[key]);
    result[key] =
      typeof value === "string" && DATE_ATTRIBUTE_KEYS.has(key)
        ? new Date(value)
        : value;
  });
  return result;
}

function hydrate<T = any>(value: any): T {
  if (Array.isArray(value)) {
    return value.map(item => hydrate(item)) as any;
  }
  if (
    value !== null &&
    typeof value === "object" &&
    typeof value.className === "string" &&
    value.attributes !== undefined
  ) {
    return (value.className === "_User"
      ? new BackendUser(value as BackendPayload)
      : new BackendObject(value as BackendPayload)) as any;
  }
  if (value !== null && typeof value === "object") {
    const result: Attributes = {};
    Object.keys(value).forEach(key => {
      result[key] = hydrate(value[key]);
    });
    return result as any;
  }
  return value;
}

function serializeAttributes(attributes: Attributes): Attributes {
  const result: Attributes = {};
  Object.keys(attributes || {}).forEach(key => {
    result[key] = serializeValue(attributes[key]);
  });
  return result;
}

function serializeValue(value: any): any {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof BackendObject) {
    return value.id;
  }
  if (Array.isArray(value)) {
    return value.map(item => serializeValue(item));
  }
  if (value !== null && typeof value === "object") {
    const result: Attributes = {};
    Object.keys(value).forEach(key => {
      result[key] = serializeValue(value[key]);
    });
    return result;
  }
  return value;
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: any } = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers:
      options.body === undefined
        ? undefined
        : {
            "Content-Type": "application/json"
          },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  if (response.status === 204) {
    return undefined as any;
  }

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || response.statusText);
  }
  return hydrate<T>(payload);
}

function query(params: Attributes): string {
  const search = new URLSearchParams();
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null) {
      search.set(key, String(value));
    }
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

function requireUserId(user: any): string {
  if (!user || !user.id) {
    throw new Error("user.id is undefined");
  }
  return user.id;
}

function idsOf(list?: Array<{ id: string } | string>): string[] {
  if (!list) {
    return [];
  }
  return list
    .map((item: { id: string } | string) =>
      typeof item === "string" ? item : item.id
    )
    .filter(Boolean);
}

function orderItems(objectList: any[]): Array<{ id: string; order: number }> {
  return objectList
    .filter(object => object && object.id)
    .map(object => ({
      id: object.id,
      order: Number(object.attributes && object.attributes.order ? object.attributes.order : 0)
    }));
}

function applyLevelRules(abilityList: BackendObject[], levelRuleList?: BackendObject[]): void {
  if (!levelRuleList || levelRuleList.length === 0) {
    return;
  }

  abilityList.forEach(ability => {
    const tomatoNumber = Number(ability.attributes.tomatoNumber || 0);
    for (let index = levelRuleList.length - 1; index >= 0; index--) {
      const rule = levelRuleList[index];
      const nextRule = levelRuleList[index + 1];
      if (tomatoNumber >= Number(rule.attributes.tomatoNumber || 0)) {
        ability.attributes.levelName = rule.attributes.name;
        ability.attributes.levelNumber = rule.attributes.level;
        ability.attributes.levelPercent = nextRule
          ? (tomatoNumber - rule.attributes.tomatoNumber) /
            (nextRule.attributes.tomatoNumber - rule.attributes.tomatoNumber)
          : 1;
        break;
      }
    }
  });
}

async function readBlobAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

const Api: any = {
  init: (): void => {
    if (!hasLocalStorage()) {
      return;
    }
    const userId = window.localStorage.getItem(USER_STORAGE_KEY);
    if (userId) {
      currentUser = new BackendUser({
        className: "_User",
        id: userId,
        createdAt: null,
        updatedAt: null,
        attributes: {
          userId,
          username: userId,
          mobilePhoneNumber: userId,
          nickName: userId,
          signature: "",
          avatarUrl: "",
          totalTomatoNumber: 0,
          totalTime: 0
        }
      });
    }
  },

  getCurrentUser: (): BackendUser | null => currentUser,

  isLoggedIn(): boolean {
    return Api.getCurrentUser() !== null;
  },

  loginWithVerificationCode: async (
    countryCode: string,
    phoneNumber: string,
    verificationCode: string
  ): Promise<BackendUser> => {
    const userId = phoneNumber.trim();
    if (!userId) {
      throw new Error("userId is required");
    }
    const user = await request<BackendUser>("/auth/login", {
      method: "POST",
      body: { userId }
    });
    currentUser = user;
    if (hasLocalStorage() && user.id) {
      window.localStorage.setItem(USER_STORAGE_KEY, user.id);
    }
    return user;
  },

  sendSmsVerifyCode: async (): Promise<void> => undefined,

  logOut: async (): Promise<void> => {
    currentUser = null;
    if (hasLocalStorage()) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  },

  savePlanList: (objectList: any[]): Promise<any> =>
    request("/plans/reorder", {
      method: "POST",
      body: { items: orderItems(objectList) }
    }),

  saveTargetList: (objectList: any[]): Promise<any> =>
    request("/targets/reorder", {
      method: "POST",
      body: { items: orderItems(objectList) }
    }),

  saveAbilityList: (objectList: any[]): Promise<any> =>
    request("/abilities/reorder", {
      method: "POST",
      body: { items: orderItems(objectList) }
    }),

  saveTargetSubjectList: (objectList: any[]): Promise<any> =>
    request("/target-subjects/reorder", {
      method: "POST",
      body: { items: orderItems(objectList) }
    }),

  fetchPlanList: async (
    user: BackendUser,
    planType: PlanType | "completed" | "all",
    currentPage?: number,
    pageSize?: number
  ): Promise<BackendObject[]> =>
    request<BackendObject[]>(
      `/plans${query({ userId: requireUserId(user), type: planType })}`
    ),

  createPlan: async (
    name: string,
    type: PlanType,
    user: BackendUser,
    target?: number,
    isActived?: boolean,
    isFinished?: boolean,
    abilityIdList?: string[],
    targetIdList?: string[],
    deadline?: Date
  ): Promise<BackendObject> =>
    request<BackendObject>("/plans", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        name,
        type,
        target,
        isActived,
        isFinished,
        abilityIdList,
        targetIdList,
        deadline
      }
    }),

  completePlan: (plan: BackendObject): Promise<BackendObject> =>
    request<BackendObject>(`/plans/${encodeURIComponent(plan.id as string)}`, {
      method: "PATCH",
      body: { isFinished: true }
    }),

  cancelCompletePlan: (plan: BackendObject): Promise<BackendObject> =>
    request<BackendObject>(`/plans/${encodeURIComponent(plan.id as string)}`, {
      method: "PATCH",
      body: { isFinished: false }
    }),

  editPlan: (
    planId: string,
    name: string,
    target: number,
    type: PlanType,
    isActived: boolean,
    isFinished: boolean,
    abilityIdList: string[],
    targetIdList: string[],
    deadline?: Date
  ): Promise<BackendObject> =>
    request<BackendObject>(`/plans/${encodeURIComponent(planId)}`, {
      method: "PATCH",
      body: {
        name,
        type,
        target: type === "daily" ? target : null,
        deadline: type === "temporary" ? deadline || null : null,
        isActived,
        isFinished,
        abilityIdList,
        targetIdList
      }
    }),

  deletePlan: (planId: string): Promise<void> =>
    request<void>(`/plans/${encodeURIComponent(planId)}`, { method: "DELETE" }),

  createTomato: (
    name: string,
    description: string,
    user: BackendUser,
    startTime: Date,
    colormap: string[]
  ): Promise<BackendObject> =>
    request<BackendObject>("/tomatoes", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        name,
        description,
        startTime,
        colormap
      }
    }),

  createTomatoPlan: (tomatoId: string, planIdList: string[]): Promise<any[]> =>
    request<any[]>("/tomato-plans", {
      method: "POST",
      body: { tomatoId, planIdList }
    }),

  createAbility: (
    name: string,
    user: BackendUser,
    description: string,
    isFinished: boolean,
    isActived: boolean,
    colormap: string[],
    planList?: { id: string; name: string }[],
    targetList?: { id: string; name: string }[]
  ): Promise<BackendObject> =>
    request<BackendObject>("/abilities", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        name,
        description,
        isFinished,
        isActived,
        colormap,
        planIdList: idsOf(planList),
        targetIdList: idsOf(targetList)
      }
    }),

  fetchAbilityList: async (
    user: BackendUser,
    isFinished: boolean,
    isActived?: boolean,
    levelRuleList?: BackendObject[],
    fetchTargetList?: boolean,
    fetchPlanList?: boolean
  ): Promise<BackendObject[]> => {
    const abilityList = await request<BackendObject[]>(
      `/abilities${query({
        userId: requireUserId(user),
        isFinished,
        isActived
      })}`
    );
    applyLevelRules(abilityList, levelRuleList);
    return abilityList;
  },

  fetchAbilityPlanList: async (): Promise<BackendObject[]> => [],

  fetchAbilityListWithPlanSelect: async (planId: string): Promise<BackendObject[]> => {
    const plan = await request<BackendObject>(`/plans/${encodeURIComponent(planId)}`);
    const abilityList = await Api.fetchAbilityList(plan.attributes.user, false);
    abilityList.forEach((ability: any) => {
      ability.attributes.selected = ability.attributes.planListOfAbility.some(
        (planOfAbility: BackendObject) => planOfAbility.id === planId
      );
    });
    return abilityList;
  },

  fetchTargetListWithPlanSelect: async (planId: string): Promise<BackendObject[]> => {
    const plan = await request<BackendObject>(`/plans/${encodeURIComponent(planId)}`);
    const targetList = await Api.fetchTargetList(plan.attributes.user, "uncompleted");
    targetList.forEach((target: any) => {
      target.attributes.selected = target.attributes.planListOfTarget.some(
        (planOfTarget: BackendObject) => planOfTarget.id === planId
      );
    });
    return targetList;
  },

  fetchAbilityListWithTargetSelect: async (targetId: string): Promise<BackendObject[]> => {
    const target = await request<BackendObject>(`/targets/${encodeURIComponent(targetId)}`);
    const abilityList = await Api.fetchAbilityList(target.attributes.user, false);
    abilityList.forEach((ability: any) => {
      ability.attributes.selected = ability.attributes.targetListOfAbility.some(
        (targetOfAbility: BackendObject) => targetOfAbility.id === targetId
      );
    });
    return abilityList;
  },

  fetchPlanListWithTargetSelect: async (targetId: string): Promise<BackendObject[]> => {
    const target = await request<BackendObject>(`/targets/${encodeURIComponent(targetId)}`);
    const planList = await request<BackendObject[]>(
      `/plans${query({
        userId: requireUserId(target.attributes.user),
        type: "all",
        onlyUnfinished: true
      })}`
    );
    planList.forEach(plan => {
      plan.attributes.selected = target.attributes.planListOfTarget.some(
        (planOfTarget: BackendObject) => planOfTarget.id === plan.id
      );
    });
    return planList;
  },

  fetchPlanListWithSelect: (user: BackendUser): Promise<BackendObject[]> =>
    request<BackendObject[]>(
      `/plans${query({
        userId: requireUserId(user),
        type: "all",
        onlyUnfinished: true
      })}`
    ),

  fetchTargetSubjectList: (user: BackendUser): Promise<BackendObject[]> =>
    request<BackendObject[]>(`/target-subjects${query({ userId: requireUserId(user) })}`),

  fetchTargetList: (
    user: BackendUser,
    targetType: "completed" | "unsubjective" | "uncompleted" | "all"
  ): Promise<BackendObject[]> =>
    request<BackendObject[]>(
      `/targets${query({ userId: requireUserId(user), type: targetType })}`
    ),

  createTarget: (
    user: BackendUser,
    targetSubjectId: string | null,
    name: string,
    description: string,
    validityType: "time-bound" | "indefinite",
    validity: Date | null,
    abilityList: { id: string; name: string }[],
    planList: { id: string; name: string }[],
    mileStoneList: InputMileStoneType[],
    isActived: boolean,
    isFinished: boolean,
    colormap: string[]
  ): Promise<BackendObject> =>
    request<BackendObject>("/targets", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        targetSubjectId,
        name,
        description,
        validityType,
        validity,
        abilityIdList: idsOf(abilityList),
        planIdList: idsOf(planList),
        mileStoneList,
        isActived,
        isFinished,
        colormap
      }
    }),

  createTargetSubject: (user: BackendUser, name: string): Promise<BackendObject> =>
    request<BackendObject>("/target-subjects", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        name
      }
    }),

  deleteTarget: (targetId: string): Promise<void> =>
    request<void>(`/targets/${encodeURIComponent(targetId)}`, { method: "DELETE" }),

  deleteTargetSubject: (targetSubjectId: string): Promise<void> =>
    request<void>(`/target-subjects/${encodeURIComponent(targetSubjectId)}`, {
      method: "DELETE"
    }),

  saveTarget: (
    targetId: string,
    user: BackendUser,
    targetSubjectId: string | null,
    name: string,
    description: string,
    validityType: "time-bound" | "indefinite",
    validity: Date | null,
    abilityList: { id: string; name: string }[],
    planList: { id: string; name: string }[],
    isActived: boolean,
    isFinished: boolean
  ): Promise<BackendObject> =>
    request<BackendObject>(`/targets/${encodeURIComponent(targetId)}`, {
      method: "PATCH",
      body: {
        userId: requireUserId(user),
        targetSubjectId,
        name,
        description,
        validityType,
        validity,
        abilityIdList: idsOf(abilityList),
        planIdList: idsOf(planList),
        isActived,
        isFinished
      }
    }),

  saveTargetSubject: (
    targetSubjectId: string,
    user: BackendUser,
    name: string
  ): Promise<BackendObject> =>
    request<BackendObject>(`/target-subjects/${encodeURIComponent(targetSubjectId)}`, {
      method: "PATCH",
      body: { userId: requireUserId(user), name }
    }),

  finishTarget: (targetId: string, isFinished: boolean): Promise<BackendObject> =>
    request<BackendObject>(`/targets/${encodeURIComponent(targetId)}`, {
      method: "PATCH",
      body: { isFinished }
    }),

  fetchLevelRuleList: (): Promise<BackendObject[]> =>
    request<BackendObject[]>("/level-rules"),

  deleteAbility: (abilityId: string): Promise<void> =>
    request<void>(`/abilities/${encodeURIComponent(abilityId)}`, { method: "DELETE" }),

  saveAbility: (
    abilityId: string,
    name: string,
    planIdList: string[],
    targetIdList: string[],
    isActived?: boolean,
    isFinished?: boolean
  ): Promise<BackendObject> =>
    request<BackendObject>(`/abilities/${encodeURIComponent(abilityId)}`, {
      method: "PATCH",
      body: { name, planIdList, targetIdList, isActived, isFinished }
    }),

  fetchTargetListWithAbilitySelect: async (
    abilityId: string | null,
    user?: BackendUser
  ): Promise<BackendObject[]> => {
    const ability =
      abilityId === null
        ? null
        : await request<BackendObject>(`/abilities/${encodeURIComponent(abilityId)}`);
    const targetUser = ability ? ability.attributes.user : user;
    if (!targetUser) {
      throw new Error("user is undefined");
    }
    const targetList = await Api.fetchTargetList(targetUser, "uncompleted");
    targetList.forEach((target: any) => {
      target.attributes.selected =
        ability !== null &&
        ability.attributes.targetListOfAbility.some(
          (targetOfAbility: BackendObject) => targetOfAbility.id === target.id
        );
    });
    return targetList;
  },

  fetchPlanListWithAbilitySelect: async (
    abilityId: string | null,
    user?: BackendUser
  ): Promise<BackendObject[]> => {
    const ability =
      abilityId === null
        ? null
        : await request<BackendObject>(`/abilities/${encodeURIComponent(abilityId)}`);
    const planUser = ability ? ability.attributes.user : user;
    if (!planUser) {
      throw new Error("user is undefined");
    }
    const planList = await request<BackendObject[]>(
      `/plans${query({
        userId: requireUserId(planUser),
        type: "all",
        onlyActive: true,
        onlyUnfinished: true
      })}`
    );
    planList.forEach(plan => {
      plan.attributes.selected =
        ability !== null &&
        ability.attributes.planListOfAbility.some(
          (planOfAbility: BackendObject) => planOfAbility.id === plan.id
        );
    });
    return planList;
  },

  fetchTomatoList: (
    user: BackendUser,
    endTime: Date = new Date(),
    startTime?: Date,
    limit?: number,
    firstQuery: boolean = false
  ): Promise<BackendObject[]> =>
    request<BackendObject[]>(
      `/tomatoes${query({
        userId: requireUserId(user),
        endTime: endTime.toISOString(),
        startTime: startTime ? startTime.toISOString() : undefined,
        limit: limit || 100,
        firstQuery
      })}`
    ),

  fetchStatTargetList: async (user: BackendUser): Promise<BackendObject[]> => {
    const tomatoList = await Api.fetchTomatoList(user);
    const statTargetList: BackendObject[] = [];
    tomatoList.forEach((tomato: any) => {
      tomato.attributes.planListOfTomato.forEach((plan: BackendObject) => {
        plan.attributes.targetListOfPlan.forEach((target: BackendObject) => {
          const object = _.cloneDeep(target);
          object.attributes.isStat = true;
          object.attributes.tomatoOfTarget = tomato;
          object.attributes.planOfTarget = plan;
          statTargetList.push(object);
        });
      });
    });
    return statTargetList;
  },

  fetchStatAbilityList: async (user: BackendUser): Promise<BackendObject[]> => {
    const tomatoList = await Api.fetchTomatoList(user);
    const statAbilityList: BackendObject[] = [];
    tomatoList.forEach((tomato: any) => {
      tomato.attributes.planListOfTomato.forEach((plan: BackendObject) => {
        plan.attributes.abilityListOfPlan.forEach((ability: BackendObject) => {
          const object = _.cloneDeep(ability);
          object.attributes.tomatoOfAbility = tomato;
          object.attributes.planOfAbility = plan;
          statAbilityList.push(object);
        });
      });
    });
    return statAbilityList;
  },

  fetchStatPlanList: async (user: BackendUser): Promise<BackendObject[]> => {
    const tomatoList = await Api.fetchTomatoList(user);
    const statPlanList: BackendObject[] = [];
    tomatoList.forEach((tomato: any) => {
      tomato.attributes.planListOfTomato.forEach((plan: BackendObject) => {
        const object = _.cloneDeep(plan);
        object.attributes.tomatoOfPlan = tomato;
        statPlanList.push(object);
      });
    });
    return statPlanList;
  },

  fetchPlanListOfTargetList: async (
    targetList: BackendObject[]
  ): Promise<BackendObject[]> => {
    for (const target of targetList) {
      if (!target.attributes.planListOfTarget && target.id) {
        const latest = await request<BackendObject>(`/targets/${encodeURIComponent(target.id)}`);
        target.attributes.planListOfTarget = latest.attributes.planListOfTarget;
      }
      target.attributes.targetTomatoNumber = 0;
      (target.attributes.planListOfTarget || []).forEach((plan: BackendObject) => {
        target.attributes.targetTomatoNumber += plan.attributes.target
          ? plan.attributes.target
          : 0;
      });
    }
    return targetList;
  },

  fetchPlanListOfAbilityList: async (
    abilityList: BackendObject[]
  ): Promise<BackendObject[]> => {
    for (const ability of abilityList) {
      if (!ability.attributes.planListOfAbility && ability.id) {
        const latest = await request<BackendObject>(
          `/abilities/${encodeURIComponent(ability.id)}`
        );
        ability.attributes.planListOfAbility = latest.attributes.planListOfAbility;
      }
      ability.attributes.targetTomatoNumber = 0;
      (ability.attributes.planListOfAbility || []).forEach((plan: BackendObject) => {
        ability.attributes.targetTomatoNumber += plan.attributes.target
          ? plan.attributes.target
          : 0;
      });
    }
    return abilityList;
  },

  fetchTomatoListWithDateRange: async (
    user: BackendUser,
    startTime: Date,
    endTime: Date
  ): Promise<BackendObject[]> => {
    async function next(
      oldTomatoList: BackendObject[],
      cursorEndTime: Date
    ): Promise<BackendObject[]> {
      const limit = 1000;
      const newTomatoList = await Api.fetchTomatoList(
        user,
        cursorEndTime,
        startTime,
        limit,
        oldTomatoList.length === 0
      );
      if (newTomatoList.length < limit) {
        return _.concat(oldTomatoList, newTomatoList);
      }
      const tomatoList = _.concat(oldTomatoList, newTomatoList);
      const lastEndTime = tomatoList[tomatoList.length - 1].attributes.startTime;
      return next(tomatoList, lastEndTime);
    }
    return next([], endTime);
  },

  uploadAvatar: async (user: BackendUser, file: File | Blob): Promise<BackendUser> => {
    const avatarUrl = await readBlobAsDataUrl(file);
    user.set("avatarUrl", avatarUrl);
    await user.save();
    return user;
  },

  updateUser: async (
    user: BackendUser,
    attributeKey: String,
    attributeValue: any
  ): Promise<BackendUser> => {
    user.set(String(attributeKey), attributeValue);
    await user.save();
    return user;
  },

  isClosedBeta: async (): Promise<boolean> => {
    try {
      const result = await request<{ value: boolean }>("/global/closed-beta");
      return Boolean(result.value);
    } catch (error) {
      return true;
    }
  },

  createMileStone: (): void => undefined,

  findOrCreateTargetSubject: (
    targetSubjectName: string,
    user: BackendUser
  ): Promise<BackendObject> =>
    request<BackendObject>("/target-subjects/find-or-create", {
      method: "POST",
      body: {
        userId: requireUserId(user),
        name: targetSubjectName
      }
    })
};

export default Api;
