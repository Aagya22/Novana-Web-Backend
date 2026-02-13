import request from "supertest";
import { app } from "../../app";
import { registerAndLogin } from "./test-helpers";

describe("Reminder API", () => {
  it("creates a reminder", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Take a break", time: "7:00 AM", recurring: false });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Take a break");
    expect(res.body.data.done).toBe(false);
  });

  it("toggles reminder done", async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Toggle", time: "8:00 AM" });

    const id = created.body.data._id as string;

    const res = await request(app)
      .patch(`/api/reminders/${id}/toggle`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.done).toBe(true);
  });

  it("lists reminders", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/reminders")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "R1", time: "9:00 AM" });

    const res = await request(app)
      .get("/api/reminders")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
