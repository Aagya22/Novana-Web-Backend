import request from "supertest";
import { app } from "../../app";
import { registerAndLogin } from "./test-helpers";

describe("Mood API", () => {
  it("creates a mood entry", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 7, note: "Feeling good" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.mood).toBe(7);
  });

  it("lists mood entries", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/moods")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: 3 });

    const res = await request(app)
      .get("/api/moods")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });
});
