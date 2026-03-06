import request from "supertest";
import { app } from "../../app";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserAndToken() {
  const payload = {
    fullName: "Test User",
    username: `testuser_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: uniqueEmail("reminder"),
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

describe("Reminder API (integration)", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  function useFakeDateOnly() {
    jest.useFakeTimers({
      doNotFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "nextTick",
        "queueMicrotask",
      ],
    });
  }

  it("1) rejects creating a reminder without auth", async () => {
    const res = await request(app)
      .post("/api/reminders")
      .send({ title: "Drink water", time: "7:00 AM" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2) creates a reminder", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Drink water", time: "7:00 AM", recurring: true });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Drink water");
  });

  it("3) lists reminders for the user", async () => {
    const token = await createUserAndToken();

    await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "R1", time: "8:00 AM" });

    const res = await request(app)
      .get("/api/reminders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("4) toggles reminder enabled", async () => {
    const token = await createUserAndToken();

    const created = await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Toggle", time: "9:00 AM" });

    const id = created.body.data._id;
    const initialEnabled = created.body.data.enabled ?? true;

    const toggled = await request(app)
      .patch(`/api/reminders/${id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    expect(toggled.status).toBe(200);
    expect(toggled.body.success).toBe(true);
    expect(toggled.body.data.enabled).toBe(!initialEnabled);
  });

  it("5) deletes a reminder", async () => {
    const token = await createUserAndToken();

    const created = await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete", time: "10:00 AM" });

    const id = created.body.data._id;

    const deleted = await request(app)
      .delete(`/api/reminders/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);

    const list = await request(app)
      .get("/api/reminders")
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });

  it("6) does not backfill when reminder is created after scheduled time", async () => {
    useFakeDateOnly();
    try {
      jest.setSystemTime(new Date(2030, 0, 15, 17, 0, 0));

      const token = await createUserAndToken();

      await request(app)
        .post("/api/reminders")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Past", time: "16:51" });

      const history = await request(app)
        .get("/api/reminders/notifications")
        .set("Authorization", `Bearer ${token}`);

      expect(history.status).toBe(200);
      expect(history.body.success).toBe(true);
      expect(Array.isArray(history.body.data)).toBe(true);
      expect(history.body.data.length).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });

  it("7) still backfills missed notifications after a title-only edit", async () => {
    useFakeDateOnly();
    try {
      jest.setSystemTime(new Date(2030, 0, 15, 9, 0, 0));

      const token = await createUserAndToken();

      const created = await request(app)
        .post("/api/reminders")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Initial", time: "10:00" });

      expect(created.status).toBe(201);
      const id = created.body.data._id;

      // Later in the day, after the reminder time has passed, change only the title.
      jest.setSystemTime(new Date(2030, 0, 15, 15, 0, 0));
      const updated = await request(app)
        .put(`/api/reminders/${id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Renamed" });

      expect(updated.status).toBe(200);

      const history = await request(app)
        .get("/api/reminders/notifications")
        .set("Authorization", `Bearer ${token}`);

      expect(history.status).toBe(200);
      expect(history.body.success).toBe(true);
      expect(Array.isArray(history.body.data)).toBe(true);
      expect(history.body.data.length).toBe(1);

      const scheduledFor = new Date(history.body.data[0].scheduledFor);
      expect(scheduledFor.getHours()).toBe(10);
      expect(scheduledFor.getMinutes()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });
});
