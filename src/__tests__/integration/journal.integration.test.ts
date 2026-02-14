import request from "supertest";
import { app } from "../../app";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function createUserAndToken() {
  const payload = {
    fullName: "Test User",
    username: `testuser_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: uniqueEmail("journal"),
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

describe("Journal API (integration)", () => {
  it("1) rejects creating a journal without auth", async () => {
    const res = await request(app)
      .post("/api/journals")
      .send({ title: "A", content: "B" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2) creates a journal", async () => {
    const token = await createUserAndToken();

    const res = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Day", content: "It was good", date: new Date().toISOString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My Day");
  });

  it("3) lists journals for the user", async () => {
    const token = await createUserAndToken();

    await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "T1", content: "C1" });

    const res = await request(app)
      .get("/api/journals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
  });

  it("4) updates a journal", async () => {
    const token = await createUserAndToken();

    const created = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Old", content: "Old content" });

    const id = created.body.data._id;

    const updated = await request(app)
      .put(`/api/journals/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "New" });

    expect(updated.status).toBe(200);
    expect(updated.body.success).toBe(true);
    expect(updated.body.data.title).toBe("New");
  });

  it("5) deletes a journal", async () => {
    const token = await createUserAndToken();

    const created = await request(app)
      .post("/api/journals")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Delete", content: "Me" });

    const id = created.body.data._id;

    const deleted = await request(app)
      .delete(`/api/journals/${id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.success).toBe(true);

    const list = await request(app)
      .get("/api/journals")
      .set("Authorization", `Bearer ${token}`);

    expect(list.status).toBe(200);
    expect(list.body.data.length).toBe(0);
  });
});
