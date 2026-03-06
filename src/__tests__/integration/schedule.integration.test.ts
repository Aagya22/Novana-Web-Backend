import request from "supertest";
import { app } from "../../app";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserAndToken(prefix = "schedule") {
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

type CreateSchedulePayload = {
  title: string;
  date: string;
  time: string;
  description?: string;
  location?: string;
};

async function createSchedule(token: string, overrides: Partial<CreateSchedulePayload> = {}) {
  const payload: CreateSchedulePayload = {
    title: "Morning Planning",
    date: "2026-03-10",
    time: "09:00",
    description: "Review priorities",
    location: "Home",
    ...overrides,
  };

  return request(app)
    .post("/api/schedules")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);
}

describe("Schedule API (integration)", () => {
  it("1) rejects creating a schedule without auth", async () => {
    const res = await request(app).post("/api/schedules").send({
      title: "No Auth",
      date: "2026-03-10",
      time: "09:00",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2) creates, fetches, updates, and deletes a schedule", async () => {
    const token = await createUserAndToken();

    const created = await createSchedule(token, { title: "Therapy Session", time: "18:30" });
    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.title).toBe("Therapy Session");

    const id = created.body.data._id as string;

    const fetched = await request(app)
      .get(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(fetched.status).toBe(200);
    expect(fetched.body.success).toBe(true);
    expect(fetched.body.data._id).toBe(id);

    const updated = await request(app)
      .put(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Therapy Follow-up", location: "Clinic" });

    expect(updated.status).toBe(200);
    expect(updated.body.success).toBe(true);
    expect(updated.body.data.title).toBe("Therapy Follow-up");
    expect(updated.body.data.location).toBe("Clinic");

    const deleted = await request(app)
      .delete(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);

    const afterDelete = await request(app)
      .get(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(afterDelete.status).toBe(404);
    expect(afterDelete.body.success).toBe(false);
  });

  it("3) supports q and date-range filters", async () => {
    const token = await createUserAndToken();

    await createSchedule(token, {
      title: "Morning Standup",
      date: "2026-03-10",
      time: "09:00",
    });
    await createSchedule(token, {
      title: "Therapy Session",
      date: "2026-03-15",
      time: "18:30",
    });
    await createSchedule(token, {
      title: "Workout",
      date: "2026-03-20",
      time: "07:00",
    });

    const byQuery = await request(app)
      .get("/api/schedules?q=therapy")
      .set("Authorization", `Bearer ${token}`);

    expect(byQuery.status).toBe(200);
    expect(byQuery.body.success).toBe(true);
    expect(byQuery.body.data.length).toBe(1);
    expect(byQuery.body.data[0].title).toBe("Therapy Session");

    const byRange = await request(app)
      .get("/api/schedules?from=2026-03-12&to=2026-03-18")
      .set("Authorization", `Bearer ${token}`);

    expect(byRange.status).toBe(200);
    expect(byRange.body.success).toBe(true);
    expect(byRange.body.data.length).toBe(1);
    expect(byRange.body.data[0].title).toBe("Therapy Session");
  });

  it("4) rejects invalid from/to filter format", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .get("/api/schedules?from=2026-3-1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("5) prevents another user from reading/updating/deleting a schedule", async () => {
    const tokenA = await createUserAndToken("schedule_owner");
    const tokenB = await createUserAndToken("schedule_other");

    const created = await createSchedule(tokenA, {
      title: "Private Appointment",
      date: "2026-03-22",
      time: "14:00",
    });
    const id = created.body.data._id as string;

    const getOther = await request(app)
      .get(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(getOther.status).toBe(404);
    expect(getOther.body.success).toBe(false);

    const updateOther = await request(app)
      .put(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "Hijacked" });

    expect(updateOther.status).toBe(404);
    expect(updateOther.body.success).toBe(false);

    const deleteOther = await request(app)
      .delete(`/api/schedules/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(deleteOther.status).toBe(404);
    expect(deleteOther.body.success).toBe(false);
  });
});
