import request from "supertest";
import { app } from "../../app";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserAndToken(prefix = "exercise") {
  const payload = {
    fullName: "Test User",
    username: `testuser_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: uniqueEmail(prefix),
    phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: "Password123",
    confirmPassword: "Password123",
  };

  const reg = await request(app).post("/api/auth/register").send(payload);
  expect(reg.status).toBe(201);

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: payload.email, password: payload.password });

  expect(login.status).toBe(200);
  return login.body.token as string;
}

type CreateExercisePayload = {
  type: string;
  duration: number;
  date?: string;
  notes?: string;
};

async function createExercise(token: string, overrides: Partial<CreateExercisePayload> = {}) {
  const payload: CreateExercisePayload = {
    type: "Walk",
    duration: 20,
    date: new Date().toISOString(),
    notes: "Daily movement",
    ...overrides,
  };

  return request(app)
    .post("/api/exercises")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);
}

describe("Exercise API (integration)", () => {
  it("1) rejects creating exercise without auth", async () => {
    const res = await request(app).post("/api/exercises").send({
      type: "Run",
      duration: 25,
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2) creates and lists manual exercises", async () => {
    const token = await createUserAndToken();

    const created = await createExercise(token, { type: "Run", duration: 25 });

    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.type).toBe("Run");
    expect(created.body.data.duration).toBe(25);
    expect(created.body.data.source).toBe("manual");

    const list = await request(app)
      .get("/api/exercises")
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.length).toBe(1);
  });

  it("3) validates guided completion payload", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/exercises/guided/complete")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Box Breathing",
        category: "breathing",
        plannedDurationSeconds: 300,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("4) completes guided exercise and returns grouped guided history", async () => {
    const token = await createUserAndToken();

    const complete = await request(app)
      .post("/api/exercises/guided/complete")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Body Scan",
        category: "mindfulness",
        plannedDurationSeconds: 120,
        elapsedSeconds: 90,
        completedAt: "2026-03-01T10:00:00.000Z",
      });

    expect(complete.status).toBe(201);
    expect(complete.body.success).toBe(true);
    expect(complete.body.data.source).toBe("guided");

    const history = await request(app)
      .get("/api/exercises/guided/history")
      .set("Authorization", `Bearer ${token}`);

    expect(history.status).toBe(200);
    expect(history.body.success).toBe(true);
    expect(Array.isArray(history.body.data)).toBe(true);
    expect(history.body.data.length).toBe(1);
    expect(history.body.data[0]).toHaveProperty("date", "2026-03-01");
    expect(history.body.data[0]).toHaveProperty("totalMinutes", 2);
    expect(Array.isArray(history.body.data[0].sessions)).toBe(true);
    expect(history.body.data[0].sessions.length).toBe(1);
  });

  it("5) updates and deletes own exercise", async () => {
    const token = await createUserAndToken();

    const created = await createExercise(token, { type: "Yoga", duration: 30 });
    const id = created.body.data._id as string;

    const updated = await request(app)
      .put(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ duration: 35, notes: "Felt stronger" });

    expect(updated.status).toBe(200);
    expect(updated.body.success).toBe(true);
    expect(updated.body.data.duration).toBe(35);
    expect(updated.body.data.notes).toBe("Felt stronger");

    const deleted = await request(app)
      .delete(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);

    const getAfterDelete = await request(app)
      .get(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getAfterDelete.status).toBe(404);
    expect(getAfterDelete.body.success).toBe(false);
  });

  it("6) clears exercise history only for the current user", async () => {
    const tokenA = await createUserAndToken("exercise_a");
    const tokenB = await createUserAndToken("exercise_b");

    await createExercise(tokenA, { type: "Walk", duration: 20 });
    await createExercise(tokenA, { type: "Run", duration: 15 });

    await createExercise(tokenB, { type: "Cycle", duration: 40 });

    const clear = await request(app)
      .delete("/api/exercises/history")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(clear.status).toBe(200);
    expect(clear.body.success).toBe(true);
    expect(clear.body.data.deletedCount).toBe(2);

    const listA = await request(app)
      .get("/api/exercises")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(listA.status).toBe(200);
    expect(listA.body.data.length).toBe(0);

    const listB = await request(app)
      .get("/api/exercises")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(listB.status).toBe(200);
    expect(listB.body.data.length).toBe(1);
  });

  it("7) prevents another user from reading/updating/deleting an exercise", async () => {
    const tokenA = await createUserAndToken("exercise_owner");
    const tokenB = await createUserAndToken("exercise_other");

    const created = await createExercise(tokenA, { type: "Swim", duration: 45 });
    const id = created.body.data._id as string;

    const getOther = await request(app)
      .get(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(getOther.status).toBe(404);
    expect(getOther.body.success).toBe(false);

    const updateOther = await request(app)
      .put(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ duration: 10 });

    expect(updateOther.status).toBe(404);
    expect(updateOther.body.success).toBe(false);

    const deleteOther = await request(app)
      .delete(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(deleteOther.status).toBe(404);
    expect(deleteOther.body.success).toBe(false);
  });
});
