const API_BASE_URL = (process.env.TIMEBARRIER_API_URL || "http://127.0.0.1:3999/api").replace(/\/$/, "");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(path, options = {}) {
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

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return payload;
}

async function main() {
  const suffix = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const userId = `smoke-${suffix}`;

  const health = await request("/health");
  assert(health.ok === true, "health check failed");

  const user = await request("/auth/login", {
    method: "POST",
    body: { userId }
  });
  assert(user.id === userId, "login did not return the requested user");

  const plan = await request("/plans", {
    method: "POST",
    body: {
      userId,
      name: "Smoke plan",
      type: "temporary",
      target: 3,
      isActived: true,
      isFinished: false
    }
  });

  const ability = await request("/abilities", {
    method: "POST",
    body: {
      userId,
      name: "Smoke ability",
      planIdList: [plan.id]
    }
  });

  const subject = await request("/target-subjects", {
    method: "POST",
    body: {
      userId,
      name: "Smoke subject"
    }
  });

  const target = await request("/targets", {
    method: "POST",
    body: {
      userId,
      targetSubjectId: subject.id,
      name: "Smoke target",
      description: "Verify MySQL relations",
      validityType: "indefinite",
      abilityIdList: [ability.id],
      planIdList: [plan.id],
      mileStoneList: [{ name: "First milestone", isFinished: false }]
    }
  });

  const tomato = await request("/tomatoes", {
    method: "POST",
    body: {
      userId,
      name: "Smoke tomato",
      description: "Created by smoke harness",
      startTime: new Date().toISOString()
    }
  });

  await request("/tomato-plans", {
    method: "POST",
    body: {
      tomatoId: tomato.id,
      planIdList: [plan.id]
    }
  });

  const plans = await request(`/plans?userId=${encodeURIComponent(userId)}&type=temporary`);
  const subjects = await request(`/target-subjects?userId=${encodeURIComponent(userId)}`);
  const abilities = await request(`/abilities?userId=${encodeURIComponent(userId)}&isFinished=false`);
  const tomatoes = await request(`/tomatoes?userId=${encodeURIComponent(userId)}`);

  assert(plans.length === 1, "plan list should contain one item");
  assert(plans[0].attributes.abilityListOfPlan.length === 1, "plan should be linked to ability");
  assert(plans[0].attributes.targetListOfPlan.length === 1, "plan should be linked to target");
  assert(plans[0].attributes.tomatoNumber === 1, "plan should include one tomato");
  assert(subjects.length === 1, "target subject list should contain one item");
  assert(subjects[0].attributes.targetListOfTargetSubject.length === 1, "subject should include target");
  assert(abilities.length === 1, "ability list should contain one item");
  assert(abilities[0].attributes.targetListOfAbility.length === 1, "ability should be linked to target");
  assert(tomatoes.length === 1, "tomato list should contain one item");
  assert(tomatoes[0].attributes.planListOfTomato.length === 1, "tomato should be linked to plan");

  console.log(
    JSON.stringify(
      {
        api: API_BASE_URL,
        user: user.id,
        plan: plan.id,
        ability: ability.id,
        subject: subject.id,
        target: target.id,
        tomato: tomato.id
      },
      null,
      2
    )
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
