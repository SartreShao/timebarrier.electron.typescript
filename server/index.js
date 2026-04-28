const express = require("express");
const cors = require("cors");
const { pool, transaction, config } = require("./db");

const app = express();
const port = Number(process.env.PORT || 3999);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function bool(value) {
  return value === true || value === 1 || value === "1";
}

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

async function exec(db, sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

function route(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

function cleanUserId(value) {
  const userId = String(value || "").trim();
  if (!userId) {
    const error = new Error("userId is required");
    error.status = 400;
    throw error;
  }
  return userId;
}

function object(className, row, attributes) {
  return {
    className,
    id: row.id,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at || row.created_at),
    attributes
  };
}

function userPointer(userId) {
  return {
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
      avatarUrl: ""
    }
  };
}

async function ensureUser(userId, db = pool) {
  const id = cleanUserId(userId);
  await exec(
    db,
    `INSERT INTO users (id, nick_name, signature, avatar_url)
     VALUES (?, ?, '', '')
     ON DUPLICATE KEY UPDATE id = id`,
    [id, id]
  );
  return getUser(id, db);
}

async function getUser(userId, db = pool) {
  const id = cleanUserId(userId);
  const rows = await exec(
    db,
    `SELECT
       u.*,
       COUNT(t.id) AS total_tomato_number,
       COALESCE(SUM(t.duration_ms), 0) AS total_time
     FROM users u
     LEFT JOIN tomatoes t ON t.user_id = u.id
     WHERE u.id = ?
     GROUP BY u.id`,
    [id]
  );
  if (rows.length === 0) {
    return ensureUser(id, db);
  }
  const row = rows[0];
  return object("_User", row, {
    userId: row.id,
    username: row.id,
    mobilePhoneNumber: row.id,
    nickName: row.nick_name || row.id,
    signature: row.signature || "",
    avatarUrl: row.avatar_url || "",
    totalTomatoNumber: Number(row.total_tomato_number || 0),
    totalTime: Number(row.total_time || 0)
  });
}

function planObject(row) {
  return object("Plan", row, {
    user: userPointer(row.user_id),
    name: row.name,
    type: row.type,
    target: row.target_count === null ? undefined : Number(row.target_count),
    deadline: iso(row.deadline),
    isActived: bool(row.is_actived),
    isFinished: bool(row.is_finished),
    order: Number(row.order_index || 0),
    tomatoNumber: Number(row.tomato_number || 0),
    todayTomatoNumber: Number(row.today_tomato_number || 0),
    totalTime: Number(row.total_time || 0),
    selected: false,
    abilityListOfPlan: [],
    targetListOfPlan: []
  });
}

function abilityObject(row) {
  return object("Ability", row, {
    user: userPointer(row.user_id),
    name: row.name,
    description: row.description || "",
    color: row.color || "",
    isActived: bool(row.is_actived),
    isFinished: bool(row.is_finished),
    order: Number(row.order_index || 0),
    tomatoNumber: Number(row.tomato_number || 0),
    totalTime: Number(row.total_time || 0),
    selected: false,
    targetListOfAbility: [],
    planListOfAbility: []
  });
}

function targetSubjectObject(row) {
  return object("TargetSubject", row, {
    user: userPointer(row.user_id),
    name: row.name,
    order: Number(row.order_index || 0),
    showSubjectList: true,
    targetListOfTargetSubject: []
  });
}

function targetObject(row) {
  const subject =
    row.target_subject_id && row.target_subject_name
      ? targetSubjectObject({
          id: row.target_subject_id,
          user_id: row.user_id,
          name: row.target_subject_name,
          order_index: row.target_subject_order || 0,
          created_at: row.target_subject_created_at,
          updated_at: row.target_subject_updated_at
        })
      : null;

  return object("Target", row, {
    user: userPointer(row.user_id),
    targetSubject: subject,
    name: row.name,
    description: row.description || "",
    validityType: row.validity_type || "indefinite",
    validity: iso(row.validity),
    color: row.color || "",
    isActived: bool(row.is_actived),
    isFinished: bool(row.is_finished),
    order: Number(row.order_index || 0),
    tomatoNumber: Number(row.tomato_number || 0),
    totalTime: Number(row.total_time || 0),
    selected: false,
    abilityListOfTarget: [],
    planListOfTarget: [],
    mileStoneListOfTarget: []
  });
}

function milestoneObject(row) {
  return object("MileStone", row, {
    target: row.target_id ? { id: row.target_id, className: "Target", attributes: {} } : null,
    name: row.name,
    color: row.color || "",
    isFinished: bool(row.is_finished),
    order: Number(row.order_index || 0)
  });
}

function levelRuleObject(row) {
  return object("LevelRule", row, {
    name: row.name,
    level: Number(row.level),
    tomatoNumber: Number(row.tomato_number)
  });
}

function tomatoObject(row) {
  return object("Tomato", row, {
    user: userPointer(row.user_id),
    name: row.name,
    description: row.description || "",
    startTime: iso(row.start_time),
    duration: Number(row.duration_ms || 0),
    color: row.color || "",
    planListOfTomato: []
  });
}

function indexById(list) {
  return new Map(list.map(item => [item.id, item]));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function getPlanObjectsByIds(ids) {
  if (ids.length === 0) {
    return [];
  }
  const rows = await exec(
    pool,
    `SELECT
       p.*,
       COUNT(DISTINCT tp.tomato_id) AS tomato_number,
       COALESCE(SUM(t.duration_ms), 0) AS total_time,
       COALESCE(SUM(CASE WHEN DATE(t.start_time) = CURDATE() THEN 1 ELSE 0 END), 0) AS today_tomato_number
     FROM plans p
     LEFT JOIN tomato_plans tp ON tp.plan_id = p.id
     LEFT JOIN tomatoes t ON t.id = tp.tomato_id
     WHERE p.id IN (?)
     GROUP BY p.id`,
    [ids]
  );
  return rows.map(planObject);
}

async function getAbilityObjectsByIds(ids) {
  if (ids.length === 0) {
    return [];
  }
  const rows = await exec(
    pool,
    `SELECT
       a.*,
       COUNT(DISTINCT tp.tomato_id) AS tomato_number,
       COALESCE(SUM(t.duration_ms), 0) AS total_time
     FROM abilities a
     LEFT JOIN ability_plans ap ON ap.ability_id = a.id
     LEFT JOIN tomato_plans tp ON tp.plan_id = ap.plan_id
     LEFT JOIN tomatoes t ON t.id = tp.tomato_id
     WHERE a.id IN (?)
     GROUP BY a.id`,
    [ids]
  );
  return rows.map(abilityObject);
}

async function getTargetObjectsByIds(ids) {
  if (ids.length === 0) {
    return [];
  }
  const rows = await exec(
    pool,
    `SELECT
       t.*,
       ts.name AS target_subject_name,
       ts.order_index AS target_subject_order,
       ts.created_at AS target_subject_created_at,
       ts.updated_at AS target_subject_updated_at,
       COUNT(DISTINCT tpom.tomato_id) AS tomato_number,
       COALESCE(SUM(tm.duration_ms), 0) AS total_time
     FROM targets t
     LEFT JOIN target_subjects ts ON ts.id = t.target_subject_id
     LEFT JOIN target_plans tpl ON tpl.target_id = t.id
     LEFT JOIN tomato_plans tpom ON tpom.plan_id = tpl.plan_id
     LEFT JOIN tomatoes tm ON tm.id = tpom.tomato_id
     WHERE t.id IN (?)
     GROUP BY t.id`,
    [ids]
  );
  return rows.map(targetObject);
}

async function attachPlanRelations(plans) {
  const planIds = plans.map(plan => plan.id);
  if (planIds.length === 0) {
    return plans;
  }

  const abilityLinks = await exec(
    pool,
    "SELECT plan_id, ability_id FROM ability_plans WHERE plan_id IN (?) ORDER BY created_at ASC",
    [planIds]
  );
  const targetLinks = await exec(
    pool,
    "SELECT plan_id, target_id FROM target_plans WHERE plan_id IN (?) ORDER BY created_at ASC",
    [planIds]
  );
  const abilities = indexById(await getAbilityObjectsByIds(unique(abilityLinks.map(row => row.ability_id))));
  const targets = indexById(await getTargetObjectsByIds(unique(targetLinks.map(row => row.target_id))));
  const plansById = indexById(plans);

  abilityLinks.forEach(link => {
    const plan = plansById.get(link.plan_id);
    const ability = abilities.get(link.ability_id);
    if (plan && ability) {
      plan.attributes.abilityListOfPlan.push(ability);
    }
  });

  targetLinks.forEach(link => {
    const plan = plansById.get(link.plan_id);
    const target = targets.get(link.target_id);
    if (plan && target) {
      plan.attributes.targetListOfPlan.push(target);
    }
  });

  return plans;
}

async function attachAbilityRelations(abilities) {
  const abilityIds = abilities.map(ability => ability.id);
  if (abilityIds.length === 0) {
    return abilities;
  }

  const planLinks = await exec(
    pool,
    "SELECT ability_id, plan_id FROM ability_plans WHERE ability_id IN (?) ORDER BY created_at ASC",
    [abilityIds]
  );
  const targetLinks = await exec(
    pool,
    "SELECT ability_id, target_id FROM ability_targets WHERE ability_id IN (?) ORDER BY created_at ASC",
    [abilityIds]
  );
  const plans = indexById(await getPlanObjectsByIds(unique(planLinks.map(row => row.plan_id))));
  const targets = indexById(await getTargetObjectsByIds(unique(targetLinks.map(row => row.target_id))));
  const abilitiesById = indexById(abilities);

  planLinks.forEach(link => {
    const ability = abilitiesById.get(link.ability_id);
    const plan = plans.get(link.plan_id);
    if (ability && plan) {
      ability.attributes.planListOfAbility.push(plan);
    }
  });

  targetLinks.forEach(link => {
    const ability = abilitiesById.get(link.ability_id);
    const target = targets.get(link.target_id);
    if (ability && target) {
      ability.attributes.targetListOfAbility.push(target);
    }
  });

  return abilities;
}

async function attachTargetRelations(targets) {
  const targetIds = targets.map(target => target.id);
  if (targetIds.length === 0) {
    return targets;
  }

  const abilityLinks = await exec(
    pool,
    "SELECT target_id, ability_id FROM ability_targets WHERE target_id IN (?) ORDER BY created_at ASC",
    [targetIds]
  );
  const planLinks = await exec(
    pool,
    "SELECT target_id, plan_id FROM target_plans WHERE target_id IN (?) ORDER BY created_at ASC",
    [targetIds]
  );
  const milestoneRows = await exec(
    pool,
    "SELECT * FROM milestones WHERE target_id IN (?) ORDER BY order_index ASC, created_at ASC",
    [targetIds]
  );
  const abilities = indexById(await getAbilityObjectsByIds(unique(abilityLinks.map(row => row.ability_id))));
  const plans = indexById(await getPlanObjectsByIds(unique(planLinks.map(row => row.plan_id))));
  const targetsById = indexById(targets);

  abilityLinks.forEach(link => {
    const target = targetsById.get(link.target_id);
    const ability = abilities.get(link.ability_id);
    if (target && ability) {
      target.attributes.abilityListOfTarget.push(ability);
    }
  });

  planLinks.forEach(link => {
    const target = targetsById.get(link.target_id);
    const plan = plans.get(link.plan_id);
    if (target && plan) {
      target.attributes.planListOfTarget.push(plan);
    }
  });

  milestoneRows.forEach(row => {
    const target = targetsById.get(row.target_id);
    if (target) {
      target.attributes.mileStoneListOfTarget.push(milestoneObject(row));
    }
  });

  return targets;
}

async function fetchPlans({ userId, type, onlyActive = false, onlyUnfinished = false }) {
  const where = ["p.user_id = ?"];
  const params = [userId];
  let orderBy = "p.created_at DESC";

  if (type === "temporary" || type === "daily") {
    where.push("p.type = ?");
    params.push(type);
    where.push("p.is_finished = 0");
    orderBy = "p.order_index ASC, p.created_at DESC";
  } else if (type === "completed") {
    where.push("p.is_finished = 1");
    orderBy = "p.updated_at DESC";
  }

  if (onlyActive) {
    where.push("p.is_actived = 1");
  }
  if (onlyUnfinished) {
    where.push("p.is_finished = 0");
  }

  const rows = await exec(
    pool,
    `SELECT
       p.*,
       COUNT(DISTINCT tp.tomato_id) AS tomato_number,
       COALESCE(SUM(t.duration_ms), 0) AS total_time,
       COALESCE(SUM(CASE WHEN DATE(t.start_time) = CURDATE() THEN 1 ELSE 0 END), 0) AS today_tomato_number
     FROM plans p
     LEFT JOIN tomato_plans tp ON tp.plan_id = p.id
     LEFT JOIN tomatoes t ON t.id = tp.tomato_id
     WHERE ${where.join(" AND ")}
     GROUP BY p.id
     ORDER BY ${orderBy}`,
    params
  );

  return attachPlanRelations(rows.map(planObject));
}

async function fetchAbilities({ userId, isFinished, isActived }) {
  const where = ["a.user_id = ?", "a.is_finished = ?"];
  const params = [userId, isFinished ? 1 : 0];

  if (isActived !== undefined) {
    where.push("a.is_actived = ?");
    params.push(isActived ? 1 : 0);
  }

  const rows = await exec(
    pool,
    `SELECT
       a.*,
       COUNT(DISTINCT tp.tomato_id) AS tomato_number,
       COALESCE(SUM(tm.duration_ms), 0) AS total_time
     FROM abilities a
     LEFT JOIN ability_plans ap ON ap.ability_id = a.id
     LEFT JOIN tomato_plans tp ON tp.plan_id = ap.plan_id
     LEFT JOIN tomatoes tm ON tm.id = tp.tomato_id
     WHERE ${where.join(" AND ")}
     GROUP BY a.id
     ORDER BY a.order_index ASC, a.created_at DESC`,
    params
  );

  return attachAbilityRelations(rows.map(abilityObject));
}

async function fetchTargets({ userId, type }) {
  const where = ["t.user_id = ?"];
  const params = [userId];

  if (type === "completed") {
    where.push("t.is_finished = 1");
  } else if (type === "unsubjective") {
    where.push("t.target_subject_id IS NULL");
    where.push("t.is_finished = 0");
  } else if (type === "uncompleted") {
    where.push("t.is_finished = 0");
  }

  const rows = await exec(
    pool,
    `SELECT
       t.*,
       ts.name AS target_subject_name,
       ts.order_index AS target_subject_order,
       ts.created_at AS target_subject_created_at,
       ts.updated_at AS target_subject_updated_at,
       COUNT(DISTINCT tpom.tomato_id) AS tomato_number,
       COALESCE(SUM(tm.duration_ms), 0) AS total_time
     FROM targets t
     LEFT JOIN target_subjects ts ON ts.id = t.target_subject_id
     LEFT JOIN target_plans tpl ON tpl.target_id = t.id
     LEFT JOIN tomato_plans tpom ON tpom.plan_id = tpl.plan_id
     LEFT JOIN tomatoes tm ON tm.id = tpom.tomato_id
     WHERE ${where.join(" AND ")}
     GROUP BY t.id
     ORDER BY t.order_index ASC, t.created_at DESC`,
    params
  );

  return attachTargetRelations(rows.map(targetObject));
}

async function fetchTargetSubjects(userId) {
  const rows = await exec(
    pool,
    `SELECT * FROM target_subjects
     WHERE user_id = ?
     ORDER BY order_index ASC, created_at DESC`,
    [userId]
  );
  const subjects = rows.map(targetSubjectObject);
  const subjectMap = indexById(subjects);
  const targets = await fetchTargets({ userId, type: "uncompleted" });

  targets.forEach(target => {
    const targetSubject = target.attributes.targetSubject;
    if (!targetSubject) {
      return;
    }
    const subject = subjectMap.get(targetSubject.id);
    if (subject) {
      subject.attributes.targetListOfTargetSubject.push(target);
    }
  });

  return subjects;
}

async function replaceRelations(db, table, parentColumn, parentId, childColumn, childIds, prefix) {
  await exec(db, `DELETE FROM ${table} WHERE ${parentColumn} = ?`, [parentId]);
  for (const childId of unique(childIds || [])) {
    await exec(
      db,
      `INSERT IGNORE INTO ${table} (id, ${parentColumn}, ${childColumn}) VALUES (?, ?, ?)`,
      [createId(prefix), parentId, childId]
    );
  }
}

async function lastColor(table, userId, fallbackColors) {
  const colors = Array.isArray(fallbackColors) && fallbackColors.length > 0 ? fallbackColors : ["#D87366"];
  const rows = await exec(
    pool,
    `SELECT color FROM ${table} WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  if (rows.length === 0 || !rows[0].color) {
    return colors[0];
  }
  const index = colors.indexOf(rows[0].color);
  return colors[(index + 1) % colors.length] || colors[0];
}

app.get(
  "/api/health",
  route(async (req, res) => {
    await exec(pool, "SELECT 1");
    res.json({ ok: true, database: config.database });
  })
);

app.post(
  "/api/auth/login",
  route(async (req, res) => {
    const user = await ensureUser(req.body.userId);
    res.json(user);
  })
);

app.get(
  "/api/users/:id",
  route(async (req, res) => {
    res.json(await getUser(req.params.id));
  })
);

app.patch(
  "/api/users/:id",
  route(async (req, res) => {
    await ensureUser(req.params.id);
    await exec(
      pool,
      `UPDATE users
       SET nick_name = COALESCE(?, nick_name),
           signature = COALESCE(?, signature),
           avatar_url = COALESCE(?, avatar_url)
       WHERE id = ?`,
      [
        req.body.nickName ?? req.body.nick_name ?? null,
        req.body.signature ?? null,
        req.body.avatarUrl ?? req.body.avatar_url ?? null,
        req.params.id
      ]
    );
    res.json(await getUser(req.params.id));
  })
);

app.get(
  "/api/global/closed-beta",
  route(async (req, res) => {
    const rows = await exec(pool, "SELECT JSON_EXTRACT(value_json, '$') AS value FROM global_settings WHERE name = 'closedBeta'");
    const rawValue = rows.length === 0 ? true : rows[0].value;
    const value = typeof rawValue === "string" ? JSON.parse(rawValue) : rawValue;
    res.json({ value: Boolean(value) });
  })
);

app.get(
  "/api/level-rules",
  route(async (req, res) => {
    const rows = await exec(pool, "SELECT level AS id, level, name, tomato_number, created_at, updated_at FROM level_rules ORDER BY level ASC");
    res.json(rows.map(levelRuleObject));
  })
);

app.get(
  "/api/plans",
  route(async (req, res) => {
    const userId = cleanUserId(req.query.userId);
    await ensureUser(userId);
    res.json(
      await fetchPlans({
        userId,
        type: req.query.type || "all",
        onlyActive: req.query.onlyActive === "true",
        onlyUnfinished: req.query.onlyUnfinished === "true"
      })
    );
  })
);

app.get(
  "/api/plans/:id",
  route(async (req, res) => {
    const plans = await getPlanObjectsByIds([req.params.id]);
    res.json((await attachPlanRelations(plans))[0] || null);
  })
);

app.post(
  "/api/plans",
  route(async (req, res) => {
    const plan = await transaction(async db => {
      await ensureUser(req.body.userId, db);
      const id = createId("plan");
      await exec(
        db,
        `INSERT INTO plans
         (id, user_id, name, type, target_count, deadline, is_actived, is_finished, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          id,
          req.body.userId,
          req.body.name,
          req.body.type,
          req.body.target ?? null,
          req.body.deadline ? new Date(req.body.deadline) : null,
          req.body.isActived === undefined ? 1 : bool(req.body.isActived) ? 1 : 0,
          req.body.isFinished === undefined ? 0 : bool(req.body.isFinished) ? 1 : 0
        ]
      );
      await replaceRelations(db, "ability_plans", "plan_id", id, "ability_id", req.body.abilityIdList, "ap");
      await replaceRelations(db, "target_plans", "plan_id", id, "target_id", req.body.targetIdList, "tp");
      return id;
    });
    const plans = await getPlanObjectsByIds([plan]);
    res.status(201).json((await attachPlanRelations(plans))[0]);
  })
);

app.patch(
  "/api/plans/:id",
  route(async (req, res) => {
    await transaction(async db => {
      const hasTarget = Object.prototype.hasOwnProperty.call(req.body, "target");
      const hasDeadline = Object.prototype.hasOwnProperty.call(req.body, "deadline");
      await exec(
        db,
        `UPDATE plans
         SET name = COALESCE(?, name),
             type = COALESCE(?, type),
             target_count = IF(? = 1, ?, target_count),
             deadline = IF(? = 1, ?, deadline),
             is_actived = COALESCE(?, is_actived),
             is_finished = COALESCE(?, is_finished)
         WHERE id = ?`,
        [
          req.body.name ?? null,
          req.body.type ?? null,
          hasTarget ? 1 : 0,
          req.body.target ?? null,
          hasDeadline ? 1 : 0,
          req.body.deadline ? new Date(req.body.deadline) : null,
          req.body.isActived === undefined ? null : bool(req.body.isActived) ? 1 : 0,
          req.body.isFinished === undefined ? null : bool(req.body.isFinished) ? 1 : 0,
          req.params.id
        ]
      );
      if (req.body.abilityIdList) {
        await replaceRelations(db, "ability_plans", "plan_id", req.params.id, "ability_id", req.body.abilityIdList, "ap");
      }
      if (req.body.targetIdList) {
        await replaceRelations(db, "target_plans", "plan_id", req.params.id, "target_id", req.body.targetIdList, "tp");
      }
    });
    const plans = await getPlanObjectsByIds([req.params.id]);
    res.json((await attachPlanRelations(plans))[0]);
  })
);

app.delete(
  "/api/plans/:id",
  route(async (req, res) => {
    await exec(pool, "DELETE FROM plans WHERE id = ?", [req.params.id]);
    res.status(204).end();
  })
);

app.post(
  "/api/plans/reorder",
  route(async (req, res) => {
    await transaction(async db => {
      for (const item of req.body.items || []) {
        await exec(db, "UPDATE plans SET order_index = ? WHERE id = ?", [Number(item.order || 0), item.id]);
      }
    });
    res.json({ ok: true });
  })
);

app.get(
  "/api/abilities",
  route(async (req, res) => {
    const userId = cleanUserId(req.query.userId);
    await ensureUser(userId);
    res.json(
      await fetchAbilities({
        userId,
        isFinished: req.query.isFinished === "true",
        isActived: req.query.isActived === undefined ? undefined : req.query.isActived === "true"
      })
    );
  })
);

app.get(
  "/api/abilities/:id",
  route(async (req, res) => {
    const abilities = await getAbilityObjectsByIds([req.params.id]);
    res.json((await attachAbilityRelations(abilities))[0] || null);
  })
);

app.post(
  "/api/abilities",
  route(async (req, res) => {
    const id = await transaction(async db => {
      await ensureUser(req.body.userId, db);
      const abilityId = createId("ability");
      const color = await lastColor("abilities", req.body.userId, req.body.colormap);
      await exec(
        db,
        `INSERT INTO abilities
         (id, user_id, name, description, color, is_actived, is_finished, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          abilityId,
          req.body.userId,
          req.body.name,
          req.body.description || "",
          color,
          bool(req.body.isActived) ? 1 : 0,
          bool(req.body.isFinished) ? 1 : 0
        ]
      );
      await replaceRelations(db, "ability_plans", "ability_id", abilityId, "plan_id", req.body.planIdList, "ap");
      await replaceRelations(db, "ability_targets", "ability_id", abilityId, "target_id", req.body.targetIdList, "at");
      return abilityId;
    });
    const abilities = await getAbilityObjectsByIds([id]);
    res.status(201).json((await attachAbilityRelations(abilities))[0]);
  })
);

app.patch(
  "/api/abilities/:id",
  route(async (req, res) => {
    await transaction(async db => {
      await exec(
        db,
        `UPDATE abilities
         SET name = COALESCE(?, name),
             is_actived = COALESCE(?, is_actived),
             is_finished = COALESCE(?, is_finished)
         WHERE id = ?`,
        [
          req.body.name ?? null,
          req.body.isActived === undefined ? null : bool(req.body.isActived) ? 1 : 0,
          req.body.isFinished === undefined ? null : bool(req.body.isFinished) ? 1 : 0,
          req.params.id
        ]
      );
      if (req.body.planIdList) {
        await replaceRelations(db, "ability_plans", "ability_id", req.params.id, "plan_id", req.body.planIdList, "ap");
      }
      if (req.body.targetIdList) {
        await replaceRelations(db, "ability_targets", "ability_id", req.params.id, "target_id", req.body.targetIdList, "at");
      }
    });
    const abilities = await getAbilityObjectsByIds([req.params.id]);
    res.json((await attachAbilityRelations(abilities))[0]);
  })
);

app.delete(
  "/api/abilities/:id",
  route(async (req, res) => {
    await exec(pool, "DELETE FROM abilities WHERE id = ?", [req.params.id]);
    res.status(204).end();
  })
);

app.post(
  "/api/abilities/reorder",
  route(async (req, res) => {
    await transaction(async db => {
      for (const item of req.body.items || []) {
        await exec(db, "UPDATE abilities SET order_index = ? WHERE id = ?", [Number(item.order || 0), item.id]);
      }
    });
    res.json({ ok: true });
  })
);

app.get(
  "/api/targets",
  route(async (req, res) => {
    const userId = cleanUserId(req.query.userId);
    await ensureUser(userId);
    res.json(await fetchTargets({ userId, type: req.query.type || "all" }));
  })
);

app.get(
  "/api/targets/:id",
  route(async (req, res) => {
    const targets = await getTargetObjectsByIds([req.params.id]);
    res.json((await attachTargetRelations(targets))[0] || null);
  })
);

app.post(
  "/api/targets",
  route(async (req, res) => {
    const id = await transaction(async db => {
      await ensureUser(req.body.userId, db);
      const targetId = createId("target");
      const color = await lastColor("targets", req.body.userId, req.body.colormap);
      await exec(
        db,
        `INSERT INTO targets
         (id, user_id, target_subject_id, name, description, validity_type, validity, color, is_actived, is_finished, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          targetId,
          req.body.userId,
          req.body.targetSubjectId || null,
          req.body.name,
          req.body.description || "",
          req.body.validityType || "indefinite",
          req.body.validity ? new Date(req.body.validity) : null,
          color,
          bool(req.body.isActived) ? 1 : 0,
          bool(req.body.isFinished) ? 1 : 0
        ]
      );
      await replaceRelations(db, "ability_targets", "target_id", targetId, "ability_id", req.body.abilityIdList, "at");
      await replaceRelations(db, "target_plans", "target_id", targetId, "plan_id", req.body.planIdList, "tp");
      for (const [index, milestone] of (req.body.mileStoneList || []).entries()) {
        await exec(
          db,
          `INSERT INTO milestones (id, target_id, name, color, is_finished, order_index)
           VALUES (?, ?, ?, ?, 0, ?)`,
          [createId("mile"), targetId, milestone.name, milestone.color || "", index]
        );
      }
      return targetId;
    });
    const targets = await getTargetObjectsByIds([id]);
    res.status(201).json((await attachTargetRelations(targets))[0]);
  })
);

app.patch(
  "/api/targets/:id",
  route(async (req, res) => {
    await transaction(async db => {
      const hasTargetSubject = Object.prototype.hasOwnProperty.call(req.body, "targetSubjectId");
      const hasValidity = Object.prototype.hasOwnProperty.call(req.body, "validity");
      await exec(
        db,
        `UPDATE targets
         SET user_id = COALESCE(?, user_id),
             target_subject_id = IF(? = 1, ?, target_subject_id),
             name = COALESCE(?, name),
             description = COALESCE(?, description),
             validity_type = COALESCE(?, validity_type),
             validity = IF(? = 1, ?, validity),
             is_actived = COALESCE(?, is_actived),
             is_finished = COALESCE(?, is_finished)
         WHERE id = ?`,
        [
          req.body.userId ?? null,
          hasTargetSubject ? 1 : 0,
          req.body.targetSubjectId || null,
          req.body.name ?? null,
          req.body.description ?? null,
          req.body.validityType ?? null,
          hasValidity ? 1 : 0,
          req.body.validity ? new Date(req.body.validity) : null,
          req.body.isActived === undefined ? null : bool(req.body.isActived) ? 1 : 0,
          req.body.isFinished === undefined ? null : bool(req.body.isFinished) ? 1 : 0,
          req.params.id
        ]
      );
      if (req.body.abilityIdList) {
        await replaceRelations(db, "ability_targets", "target_id", req.params.id, "ability_id", req.body.abilityIdList, "at");
      }
      if (req.body.planIdList) {
        await replaceRelations(db, "target_plans", "target_id", req.params.id, "plan_id", req.body.planIdList, "tp");
      }
    });
    const targets = await getTargetObjectsByIds([req.params.id]);
    res.json((await attachTargetRelations(targets))[0]);
  })
);

app.delete(
  "/api/targets/:id",
  route(async (req, res) => {
    await exec(pool, "DELETE FROM targets WHERE id = ?", [req.params.id]);
    res.status(204).end();
  })
);

app.post(
  "/api/targets/reorder",
  route(async (req, res) => {
    await transaction(async db => {
      for (const item of req.body.items || []) {
        await exec(db, "UPDATE targets SET order_index = ? WHERE id = ?", [Number(item.order || 0), item.id]);
      }
    });
    res.json({ ok: true });
  })
);

app.get(
  "/api/target-subjects",
  route(async (req, res) => {
    const userId = cleanUserId(req.query.userId);
    await ensureUser(userId);
    res.json(await fetchTargetSubjects(userId));
  })
);

app.post(
  "/api/target-subjects",
  route(async (req, res) => {
    await ensureUser(req.body.userId);
    const id = createId("subject");
    await exec(
      pool,
      "INSERT INTO target_subjects (id, user_id, name, order_index) VALUES (?, ?, ?, 0)",
      [id, req.body.userId, req.body.name]
    );
    const rows = await exec(pool, "SELECT * FROM target_subjects WHERE id = ?", [id]);
    res.status(201).json(targetSubjectObject(rows[0]));
  })
);

app.post(
  "/api/target-subjects/find-or-create",
  route(async (req, res) => {
    await ensureUser(req.body.userId);
    const name = String(req.body.name || "").trim();
    if (!name) {
      const error = new Error("name is required");
      error.status = 400;
      throw error;
    }
    let rows = await exec(
      pool,
      "SELECT * FROM target_subjects WHERE user_id = ? AND name = ? ORDER BY created_at ASC LIMIT 1",
      [req.body.userId, name]
    );
    if (rows.length === 0) {
      const id = createId("subject");
      await exec(
        pool,
        "INSERT INTO target_subjects (id, user_id, name, order_index) VALUES (?, ?, ?, 0)",
        [id, req.body.userId, name]
      );
      rows = await exec(pool, "SELECT * FROM target_subjects WHERE id = ?", [id]);
    }
    res.json(targetSubjectObject(rows[0]));
  })
);

app.patch(
  "/api/target-subjects/:id",
  route(async (req, res) => {
    await exec(
      pool,
      "UPDATE target_subjects SET name = COALESCE(?, name), user_id = COALESCE(?, user_id) WHERE id = ?",
      [req.body.name ?? null, req.body.userId ?? null, req.params.id]
    );
    const rows = await exec(pool, "SELECT * FROM target_subjects WHERE id = ?", [req.params.id]);
    res.json(targetSubjectObject(rows[0]));
  })
);

app.delete(
  "/api/target-subjects/:id",
  route(async (req, res) => {
    await exec(pool, "DELETE FROM target_subjects WHERE id = ?", [req.params.id]);
    res.status(204).end();
  })
);

app.post(
  "/api/target-subjects/reorder",
  route(async (req, res) => {
    await transaction(async db => {
      for (const item of req.body.items || []) {
        await exec(db, "UPDATE target_subjects SET order_index = ? WHERE id = ?", [Number(item.order || 0), item.id]);
      }
    });
    res.json({ ok: true });
  })
);

app.get(
  "/api/tomatoes",
  route(async (req, res) => {
    const userId = cleanUserId(req.query.userId);
    await ensureUser(userId);
    const limit = Math.min(Number(req.query.limit || 100), 1000);
    const params = [userId];
    const where = ["tm.user_id = ?"];

    if (req.query.endTime) {
      if (req.query.firstQuery === "true") {
        const end = new Date(req.query.endTime);
        end.setDate(end.getDate() + 1);
        where.push("tm.start_time <= ?");
        params.push(end);
      } else {
        where.push("tm.start_time < ?");
        params.push(new Date(req.query.endTime));
      }
    }
    if (req.query.startTime) {
      where.push("tm.start_time >= ?");
      params.push(new Date(req.query.startTime));
    }
    params.push(limit);

    const rows = await exec(
      pool,
      `SELECT tm.*
       FROM tomatoes tm
       WHERE ${where.join(" AND ")}
       ORDER BY tm.start_time DESC
       LIMIT ?`,
      params
    );

    const tomatoes = rows.map(tomatoObject);
    const tomatoIds = tomatoes.map(tomato => tomato.id);
    if (tomatoIds.length !== 0) {
      const links = await exec(
        pool,
        "SELECT tomato_id, plan_id FROM tomato_plans WHERE tomato_id IN (?) ORDER BY created_at DESC",
        [tomatoIds]
      );
      const plans = await attachPlanRelations(await getPlanObjectsByIds(unique(links.map(row => row.plan_id))));
      const plansById = indexById(plans);
      const tomatoesById = indexById(tomatoes);
      links.forEach(link => {
        const tomato = tomatoesById.get(link.tomato_id);
        const plan = plansById.get(link.plan_id);
        if (tomato && plan) {
          tomato.attributes.planListOfTomato.push(plan);
        }
      });
    }

    res.json(tomatoes);
  })
);

app.post(
  "/api/tomatoes",
  route(async (req, res) => {
    await ensureUser(req.body.userId);
    const id = createId("tomato");
    const startTime = req.body.startTime ? new Date(req.body.startTime) : new Date();
    const now = new Date();
    const duration = Math.max(0, now.getTime() - startTime.getTime());
    const color = await lastColor("tomatoes", req.body.userId, req.body.colormap);
    await exec(
      pool,
      `INSERT INTO tomatoes
       (id, user_id, name, description, start_time, duration_ms, color, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.body.userId, req.body.name, req.body.description || "", startTime, duration, color, now, now]
    );
    const rows = await exec(pool, "SELECT * FROM tomatoes WHERE id = ?", [id]);
    res.status(201).json(tomatoObject(rows[0]));
  })
);

app.post(
  "/api/tomato-plans",
  route(async (req, res) => {
    const tomatoId = req.body.tomatoId;
    const items = [];
    await transaction(async db => {
      for (const planId of unique(req.body.planIdList || [])) {
        const id = createId("tomatoplan");
        await exec(
          db,
          "INSERT IGNORE INTO tomato_plans (id, tomato_id, plan_id) VALUES (?, ?, ?)",
          [id, tomatoId, planId]
        );
        items.push({ id, tomatoId, planId });
      }
    });
    res.status(201).json(items);
  })
);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    error: error.message || "Internal Server Error"
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`TimeBarrier API listening on http://127.0.0.1:${port}/api`);
});
