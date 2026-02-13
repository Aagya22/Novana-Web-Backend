import request from "supertest";
import { app } from "../../app";
import { UserModel } from "../../models/user.model";
import bcryptjs from "bcryptjs";
import mongoose from "mongoose";
import { seedAdminAndLogin } from "./test-helpers";

describe("Admin Users API", () => {
  it("rejects admin endpoints without a token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects non-admin access", async () => {
    await request(app).post("/api/auth/register").send({
      fullName: "User",
      username: "normaluser",
      email: "user@example.com",
      phoneNumber: "9811111111",
      password: "password123",
      confirmPassword: "password123",
    });

    const login = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "password123",
    });

    const token = login.body.token as string;
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("paginates users (limit 10)", async () => {
    const token = await seedAdminAndLogin();

    const hashed = await bcryptjs.hash("password123", 10);
    const bulk = Array.from({ length: 22 }).map((_, i) => ({
      fullName: `User ${i}`,
      username: `user_${i}`,
      email: `user_${i}@example.com`,
      phoneNumber: `98${String(10000000 + i).padStart(8, "0")}`,
      password: hashed,
      role: "user",
    }));
    await UserModel.insertMany(bulk);

    const res = await request(app)
      .get("/api/admin/users?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(22);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(3);
  });

  it("returns 404 when admin fetches non-existent user", async () => {
    const token = await seedAdminAndLogin();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/admin/users/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("cannot create an admin via admin create user", async () => {
    const token = await seedAdminAndLogin();

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "New User",
        username: "newuser",
        email: "newuser@example.com",
        phoneNumber: "9812345678",
        password: "password123",
        confirmPassword: "password123",
        role: "admin",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const created = await UserModel.findOne({ email: "newuser@example.com" }).lean();
    expect(created).toBeTruthy();
    expect(created?.role).toBe("user");
  });

  it("cannot change a user's role via admin update", async () => {
    const token = await seedAdminAndLogin();

    const hashed = await bcryptjs.hash("password123", 10);
    const u = await UserModel.create({
      fullName: "Target",
      username: "target",
      email: "target@example.com",
      phoneNumber: "9899999999",
      password: hashed,
      role: "user",
    });

    const res = await request(app)
      .put(`/api/admin/users/${u._id}`)
      .set("Authorization", `Bearer ${token}`)
      .field("fullName", "Target Updated")
      .field("role", "admin");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const updated = await UserModel.findById(u._id).lean();
    expect(updated?.role).toBe("user");
  });

  it("deletes a user", async () => {
    const token = await seedAdminAndLogin();

    const hashed = await bcryptjs.hash("password123", 10);
    const u = await UserModel.create({
      fullName: "Delete Target",
      username: "delete_target",
      email: "delete_target@example.com",
      phoneNumber: "9898888888",
      password: hashed,
      role: "user",
    });

    const res = await request(app)
      .delete(`/api/admin/users/${u._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const exists = await UserModel.findById(u._id).lean();
    expect(exists).toBeFalsy();
  });
});
