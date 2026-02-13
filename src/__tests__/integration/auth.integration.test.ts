import request from "supertest";
import jwt from "jsonwebtoken";
import { app } from "../../app";
import { JWT_SECRET } from "../../config";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerUser(overrides?: Partial<any>) {
  const payload = {
    fullName: "Test User",
    username: `testuser_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    email: uniqueEmail("test"),
    phoneNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    password: "Password123",
    confirmPassword: "Password123",
    ...overrides,
  };

  const res = await request(app).post("/api/auth/register").send(payload);
  return { res, payload };
}

describe("Auth API (integration)", () => {
  it("1) rejects registration with missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("2) rejects registration when passwords do not match", async () => {
    const { res } = await registerUser({ confirmPassword: "Different123" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("3) registers a user and forces role=user", async () => {
    const { res } = await registerUser({ role: "admin" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("user");
  });

  it("4) rejects duplicate email registration", async () => {
    const email = uniqueEmail("dup");
    const first = await registerUser({ email, username: `u_${Date.now()}_a` });
    expect(first.res.status).toBe(201);

    const second = await registerUser({ email, username: `u_${Date.now()}_b` });
    expect(second.res.status).toBe(403);
    expect(second.res.body.success).toBe(false);
  });

  it("5) rejects duplicate username registration", async () => {
    const username = `dupuser_${Date.now()}`;
    const first = await registerUser({ username, email: uniqueEmail("a") });
    expect(first.res.status).toBe(201);

    const second = await registerUser({ username, email: uniqueEmail("b") });
    expect(second.res.status).toBe(403);
    expect(second.res.body.success).toBe(false);
  });

  it("6) logs in and returns a token", async () => {
    const { res: reg, payload } = await registerUser();
    expect(reg.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(typeof loginRes.body.token).toBe("string");
  });

  it("7) rejects login with wrong password", async () => {
    const { payload } = await registerUser();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "WrongPass123" });

    expect(loginRes.status).toBe(401);
    expect(loginRes.body.success).toBe(false);
  });

  it("8) returns 404 for login with non-existent email", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: uniqueEmail("nope"), password: "Password123" });

    expect(loginRes.status).toBe(404);
    expect(loginRes.body.success).toBe(false);
  });

  it("9) rejects whoami without a token", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("10) returns whoami for authenticated user", async () => {
    const { payload } = await registerUser();
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    const token = loginRes.body.token;
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(payload.email);
  });

  it("11) rejects update-profile without a token", async () => {
    const res = await request(app)
      .put("/api/auth/update-profile")
      .send({ fullName: "New" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("12) updates profile for authenticated user", async () => {
    const { payload } = await registerUser();
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: payload.password });

    const token = loginRes.body.token;

    const updateRes = await request(app)
      .put("/api/auth/update-profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ fullName: "Updated Name" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.fullName).toBe("Updated Name");
  });

  it("13) request-password-reset rejects missing email", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("14) request-password-reset returns 200 even for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/request-password-reset")
      .send({ email: uniqueEmail("unknown") });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("15) reset-password works with a valid token and allows login with new password", async () => {
    const { res: reg, payload } = await registerUser();
    expect(reg.status).toBe(201);

    const userId = reg.body.data.id as string;
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });

    const resetRes = await request(app)
      .post(`/api/auth/reset-password/${token}`)
      .send({ newPassword: "NewPassword123" });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: payload.email, password: "NewPassword123" });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});
