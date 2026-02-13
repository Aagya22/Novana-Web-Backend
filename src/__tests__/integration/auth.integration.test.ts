import request from "supertest";
import { app } from "../../app";
import { DEFAULT_PASSWORD } from "./test-helpers";

describe("Auth API", () => {
  it("rejects registration with missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "bad@example.com",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration when passwords do not match", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: DEFAULT_PASSWORD,
      confirmPassword: "differentPassword123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("registers a user and forces role=user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: "password123",
      confirmPassword: "password123",
      role: "admin",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("user");
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    const res = await request(app).post("/api/auth/register").send({
      fullName: "Test User 2",
      username: "testuser2",
      email: "test@example.com",
      phoneNumber: "9811111112",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("logs in and returns a token", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: "password123",
      confirmPassword: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects login with wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: DEFAULT_PASSWORD,
      confirmPassword: DEFAULT_PASSWORD,
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword123",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects whoami without a token", async () => {
    const res = await request(app).get("/api/auth/whoami");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns whoami for authenticated user", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "Test User",
      username: "testuser",
      email: "test@example.com",
      phoneNumber: "9811111111",
      password: "password123",
      confirmPassword: "password123",
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const token = login.body.token;
    const res = await request(app)
      .get("/api/auth/whoami")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
  });
});
