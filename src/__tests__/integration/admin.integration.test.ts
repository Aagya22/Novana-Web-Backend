import request from "supertest";
import { app } from "../../app";
import { UserModel } from "../../models/user.model";

function uniqueEmail(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`;
}

function uniqueUsername(prefix = "user") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function uniquePhone() {
  return `${Math.floor(1000000000 + Math.random() * 9000000000)}`;
}

async function registerUser(overrides?: Partial<any>) {
  const payload = {
    fullName: "Test User",
    username: uniqueUsername("test"),
    email: uniqueEmail("test"),
    phoneNumber: uniquePhone(),
    password: "Password123",
    confirmPassword: "Password123",
    ...overrides,
  };

  const res = await request(app).post("/api/auth/register").send(payload);
  return { res, payload };
}

async function loginUser(email: string, password: string) {
  return request(app).post("/api/auth/login").send({ email, password });
}

async function createAuthToken({ admin = false }: { admin?: boolean } = {}) {
  const { res, payload } = await registerUser();
  if (res.status !== 201) {
    throw new Error(`Failed to register user for test setup: ${res.status}`);
  }

  const userId = res.body.data.id as string;
  if (admin) {
    await UserModel.findByIdAndUpdate(userId, { role: "admin" }).exec();
  }

  const loginRes = await loginUser(payload.email, payload.password);
  if (loginRes.status !== 200) {
    throw new Error(`Failed to login user for test setup: ${loginRes.status}`);
  }

  return loginRes.body.token as string;
}

describe("Admin API (integration)", () => {
  it("1) rejects admin users endpoint without auth", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("2) rejects non-admin user on admin users endpoint", async () => {
    const token = await createAuthToken();

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Forbidden: Admins only");
  });

  it("3) allows admin to create user (forced role=user) and list users", async () => {
    const token = await createAuthToken({ admin: true });

    const createRes = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Created By Admin",
        username: uniqueUsername("adminmade"),
        email: uniqueEmail("adminmade"),
        phoneNumber: uniquePhone(),
        password: "Password123",
        confirmPassword: "Password123",
        role: "admin",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.role).toBe("user");

    const listRes = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.success).toBe(true);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.pagination.page).toBe(1);
  });

  it("4) allows admin to list notifications and mark all as read", async () => {
    const token = await createAuthToken({ admin: true });

    // Creating a user through admin endpoint emits an admin notification.
    await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Notify User",
        username: uniqueUsername("notify"),
        email: uniqueEmail("notify"),
        phoneNumber: uniquePhone(),
        password: "Password123",
        confirmPassword: "Password123",
      });

    const beforeRes = await request(app)
      .get("/api/admin/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(beforeRes.status).toBe(200);
    expect(beforeRes.body.success).toBe(true);
    expect(Array.isArray(beforeRes.body.data.notifications)).toBe(true);
    expect(beforeRes.body.data.unreadCount).toBeGreaterThanOrEqual(1);

    const markAllRes = await request(app)
      .patch("/api/admin/notifications/read-all")
      .set("Authorization", `Bearer ${token}`);

    expect(markAllRes.status).toBe(200);
    expect(markAllRes.body.success).toBe(true);

    const afterRes = await request(app)
      .get("/api/admin/notifications")
      .set("Authorization", `Bearer ${token}`);

    expect(afterRes.status).toBe(200);
    expect(afterRes.body.data.unreadCount).toBe(0);
  });
});
