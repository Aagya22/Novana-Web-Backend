import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../../repositories/auth.repository";
import { AdminNotificationRepository } from "../../../repositories/admin-notification.repository";
import { UserService } from "../../../services/user.service";

describe("UserService (unit)", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) throws when email already exists", async () => {
    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue({ _id: "u1" } as any);

    await expect(
      service.createUser({
        fullName: "Test",
        username: "tester",
        email: "test@example.com",
        phoneNumber: "9800000000",
        password: "Password123",
        confirmPassword: "Password123",
      } as any)
    ).rejects.toMatchObject({ statusCode: 403, message: "Email is already in use" });
  });

  it("2) throws when username already exists", async () => {
    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(UserRepository.prototype, "getUserByUsername").mockResolvedValue({ _id: "u1" } as any);

    await expect(
      service.createUser({
        fullName: "Test",
        username: "tester",
        email: "test@example.com",
        phoneNumber: "9800000000",
        password: "Password123",
        confirmPassword: "Password123",
      } as any)
    ).rejects.toMatchObject({ statusCode: 403, message: "Username is already taken" });
  });

  it("3) creates user and sends admin notification", async () => {
    const createSpy = jest.spyOn(UserRepository.prototype, "createUser").mockResolvedValue({
      _id: "u1",
      fullName: "Test User",
      email: "test@example.com",
      role: "user",
    } as any);

    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(UserRepository.prototype, "getUserByUsername").mockResolvedValue(null);
    const hashSpy = jest.spyOn(bcryptjs, "hash").mockResolvedValue("hashed-password" as never);
    const notifySpy = jest
      .spyOn(AdminNotificationRepository.prototype, "create")
      .mockResolvedValue({ _id: "n1" } as any);

    const result = await service.createUser({
      fullName: "Test User",
      username: "tester",
      email: "test@example.com",
      phoneNumber: "9800000000",
      password: "Password123",
      confirmPassword: "Password123",
    } as any);

    expect(hashSpy).toHaveBeenCalledWith("Password123", 10);
    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({ password: "hashed-password", email: "test@example.com" })
    );
    expect(notifySpy).toHaveBeenCalled();
    expect(result).toHaveProperty("_id", "u1");
  });

  it("4) still creates user when notification write fails", async () => {
    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);
    jest.spyOn(UserRepository.prototype, "getUserByUsername").mockResolvedValue(null);
    jest.spyOn(bcryptjs, "hash").mockResolvedValue("hashed-password" as never);
    jest.spyOn(UserRepository.prototype, "createUser").mockResolvedValue({
      _id: "u1",
      fullName: "Test User",
      email: "test@example.com",
    } as any);
    jest
      .spyOn(AdminNotificationRepository.prototype, "create")
      .mockRejectedValue(new Error("notification down"));

    const result = await service.createUser({
      fullName: "Test User",
      username: "tester",
      email: "test@example.com",
      phoneNumber: "9800000000",
      password: "Password123",
      confirmPassword: "Password123",
    } as any);

    expect(result).toHaveProperty("email", "test@example.com");
  });

  it("5) login throws when user does not exist", async () => {
    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);

    await expect(
      service.loginUser({ email: "missing@example.com", password: "Password123" } as any)
    ).rejects.toMatchObject({ statusCode: 404, message: "User not found" });
  });

  it("6) login throws when password is invalid", async () => {
    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue({
      _id: "u1",
      password: "hashed",
      role: "user",
    } as any);
    jest.spyOn(bcryptjs, "compare").mockResolvedValue(false as never);

    await expect(
      service.loginUser({ email: "test@example.com", password: "bad" } as any)
    ).rejects.toMatchObject({ statusCode: 401, message: "Invalid credentials" });
  });

  it("7) login returns signed token and user", async () => {
    const user = { _id: "u1", password: "hashed", role: "admin", email: "test@example.com" } as any;

    jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(user);
    jest.spyOn(bcryptjs, "compare").mockResolvedValue(true as never);
    const signSpy = jest.spyOn(jwt, "sign").mockReturnValue("jwt-token" as never);

    const result = await service.loginUser({ email: "test@example.com", password: "Password123" } as any);

    expect(signSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: "u1", role: "admin" }),
      expect.any(String),
      { expiresIn: "30d" }
    );
    expect(result).toEqual({ token: "jwt-token", user });
  });

});

