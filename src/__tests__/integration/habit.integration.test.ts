import request from "supertest";
import { app } from "../../app";
import { registerAndLogin } from "./test-helpers";

describe("Habit API", () => {
  it("creates a habit", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Drink Water", frequency: "daily" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Drink Water");
    expect(res.body.data.streak).toBe(0);
  });

  it("marks a habit completed and increments streak", async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Read", frequency: "daily" });

    const id = created.body.data._id as string;

    const res = await request(app)
      .patch(`/api/habits/${id}/complete`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.streak).toBe(1);
    expect(res.body.data.lastCompleted).toBeTruthy();
  });

  it("lists habits", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/habits")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Meditate", frequency: "weekly" });

    const res = await request(app)
      .get("/api/habits")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
