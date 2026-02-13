import request from "supertest";
import bcryptjs from "bcryptjs";
import { app } from "../../app";
import { UserModel } from "../../models/user.model";

export const DEFAULT_PASSWORD = "password123";

type RegisterOverrides = Partial<{
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}>;

export async function registerUser(overrides: RegisterOverrides = {}) {
  const payload = {
    fullName: "Test User",
    username: "testuser",
    email: "test@example.com",
    phoneNumber: "9811111111",
    password: DEFAULT_PASSWORD,
    confirmPassword: DEFAULT_PASSWORD,
    ...overrides,
  };

  return request(app).post("/api/auth/register").send(payload);
}

export async function loginUser(email: string, password: string = DEFAULT_PASSWORD) {
  return request(app).post("/api/auth/login").send({ email, password });
}

export async function registerAndLogin(overrides: RegisterOverrides = {}) {
  const registerRes = await registerUser(overrides);
  if (registerRes.status !== 201) {
    throw new Error(`Expected register status 201 but got ${registerRes.status}: ${JSON.stringify(registerRes.body)}`);
  }

  const email = overrides.email ?? "test@example.com";
  const password = overrides.password ?? DEFAULT_PASSWORD;
  const loginRes = await loginUser(email, password);

  if (loginRes.status !== 200 || typeof loginRes.body.token !== "string") {
    throw new Error(`Expected login status 200 with token but got ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
  }

  return loginRes.body.token as string;
}

export async function seedAdminAndLogin() {
  const password = DEFAULT_PASSWORD;
  const hashed = await bcryptjs.hash(password, 10);

  await UserModel.create({
    fullName: "Admin",
    username: "adminuser",
    email: "admin@example.com",
    phoneNumber: "9800000000",
    password: hashed,
    role: "admin",
  });

  const loginRes = await loginUser("admin@example.com", password);

  if (loginRes.status !== 200 || typeof loginRes.body.token !== "string") {
    throw new Error(`Expected admin login 200 with token but got ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
  }

  return loginRes.body.token as string;
}
