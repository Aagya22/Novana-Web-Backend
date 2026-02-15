import request from "supertest";
import { app } from "../../app";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserAndToken() {
  const payload = {
    fullName: "Test User",
    username: `testuser_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: uniqueEmail("mood"),
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

describe("Mood API (integration)", () => {
  it("1) creates a mood entry", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 8, note: "Feeling good", date: new Date().toISOString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mood).toBe(8);
  });

  it("2) enforces one mood per day (posting again today replaces)", async () => {
    const token = await createUserAndToken();

    const first = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 6, note: "Ok" });

    expect(first.status).toBe(201);
    const firstId = first.body.data._id;

    const second = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 9, note: "Much better" });

    expect(second.status).toBe(200);
    expect(second.body.success).toBe(true);
    expect(second.body.data.mood).toBe(9);
    expect(second.body.data._id).toBe(firstId);

    const list = await request(app)
      .get("/api/moods")
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.success).toBe(true);
    expect(list.body.data.length).toBe(1);
    expect(list.body.data[0].mood).toBe(9);
  });

  it("3) allows updating today's mood entry, but not yesterday's", async () => {
    const token = await createUserAndToken();

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const createdToday = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 6, note: "Ok", date: today });

    const idToday = createdToday.body.data._id;

    const updatedToday = await request(app)
      .put(`/api/moods/${idToday}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 7, note: "Better" });

    expect(updatedToday.status).toBe(200);
    expect(updatedToday.body.success).toBe(true);
    expect(updatedToday.body.data.mood).toBe(7);

    const createdYesterday = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 4, note: "Not great", date: yesterday });

    const idYesterday = createdYesterday.body.data._id;

    const updatedYesterday = await request(app)
      .put(`/api/moods/${idYesterday}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 5 });

    expect(updatedYesterday.status).toBe(403);
    expect(updatedYesterday.body.success).toBe(false);
  });

  it("4) returns mood analytics", async () => {
    const token = await createUserAndToken();

    await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 5, date: "2026-02-01" });

    await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 9, date: "2026-02-02" });

    const res = await request(app)
      .get("/api/moods/analytics")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("overTime");
    expect(res.body.data).toHaveProperty("weeklyAverage");
    expect(Array.isArray(res.body.data.overTime)).toBe(true);
    expect(Array.isArray(res.body.data.weeklyAverage)).toBe(true);
  });

  it("5) prevents accessing another user's mood entry", async () => {
    const tokenA = await createUserAndToken();
    const tokenB = await createUserAndToken();

    const created = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ mood: 8, note: "Private", date: new Date().toISOString() });

    const id = created.body.data._id;

    const getRes = await request(app)
      .get(`/api/moods/${id}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(getRes.status).toBe(404);
    expect(getRes.body.success).toBe(false);
  });

  it("6) returns overview (week grid, streak, most frequent)", async () => {
    const token = await createUserAndToken();

    await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 7, moodType: "calm", note: "steady" });

    const res = await request(app)
      .get("/api/moods/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("days");
    expect(Array.isArray(res.body.data.days)).toBe(true);
    expect(res.body.data.days.length).toBe(7);
    expect(typeof res.body.data.streak).toBe("number");
  });

  it("7) returns mood by date (or null)", async () => {
    const token = await createUserAndToken();

    const date = "2026-02-15";
    const created = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 8, moodType: "happy", date });

    expect([200, 201]).toContain(created.status);

    const found = await request(app)
      .get("/api/moods/by-date")
      .query({ date })
      .set("Authorization", `Bearer ${token}`);

    expect(found.status).toBe(200);
    expect(found.body.success).toBe(true);
    expect(found.body.data).toBeTruthy();
    expect(found.body.data.mood).toBe(8);
  });
});
