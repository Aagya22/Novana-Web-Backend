import request from "supertest";
import { app } from "../../app";
import { registerAndLogin } from "./test-helpers";

describe("Exercise API", () => {
  it("creates an exercise", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "Run", duration: 30, notes: "Easy" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.type).toBe("Run");
    expect(res.body.data.duration).toBe(30);
  });

  it("rejects creating exercise with invalid duration", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "Run", duration: 0 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("lists exercises", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "Walk", duration: 10 });

    const res = await request(app)
      .get("/api/exercises")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("updates an exercise", async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post("/api/exercises")
      .set("Authorization", `Bearer ${token}`)
      .send({ type: "Bike", duration: 20 });

    const id = created.body.data._id as string;

    const res = await request(app)
      .put(`/api/exercises/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ duration: 25 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.duration).toBe(25);
  });
});
