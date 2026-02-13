import request from "supertest";
import { app } from "../../app";
import { registerAndLogin } from "./test-helpers";

describe("Journal API", () => {
  it("rejects creating a journal without auth", async () => {
    const res = await request(app).post("/api/journals").send({
      title: "My Journal",
      content: "Hello",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("creates a journal", async () => {
    const token = await registerAndLogin();

    const res = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Journal", content: "Hello", date: new Date().toISOString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My Journal");
    expect(typeof res.body.data._id).toBe("string");
  });

  it("lists journals for the user", async () => {
    const token = await registerAndLogin();

    await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "J1", content: "C1" });

    await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "J2", content: "C2" });

    const res = await request(app)
      .get("/api/journals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(2);
  });

  it("updates a journal", async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Old", content: "Body" });

    const id = created.body.data._id as string;

    const res = await request(app)
      .put(`/api/journals/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("New");
  });

  it("deletes a journal", async () => {
    const token = await registerAndLogin();

    const created = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete", content: "Body" });

    const id = created.body.data._id as string;

    const res = await request(app)
      .delete(`/api/journals/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
