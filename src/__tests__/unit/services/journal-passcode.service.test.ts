import bcryptjs from "bcryptjs";
import { UserRepository } from "../../../repositories/auth.repository";
import { JournalPasscodeService } from "../../../services/journal-passcode.service";

describe("JournalPasscodeService (unit)", () => {
  const service = new JournalPasscodeService();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("1) getStatus throws when user is missing", async () => {
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue(null);

    await expect(service.getStatus("u1")).rejects.toMatchObject({
      statusCode: 404,
      message: "User not found",
    });
  });

  it("2) setPasscode rejects invalid app password", async () => {
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue({ _id: "u1", password: "hash" } as any);
    jest.spyOn(bcryptjs, "compare").mockResolvedValue(false as never);

    await expect(service.setPasscode("u1", "1234", "WrongPass")).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid password",
    });
  });

  it("3) setPasscode stores hash and enables passcode", async () => {
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue({ _id: "u1", password: "hash" } as any);
    jest.spyOn(bcryptjs, "compare").mockResolvedValue(true as never);
    jest.spyOn(bcryptjs, "hash").mockResolvedValue("passcode-hash" as never);

    const updateSpy = jest
      .spyOn(UserRepository.prototype, "updateJournalPasscode")
      .mockResolvedValue({ _id: "u1" } as any);

    const result = await service.setPasscode("u1", "1234", "Password123");

    expect(result).toEqual({ enabled: true });
    expect(updateSpy).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        journalPasscodeHash: "passcode-hash",
        journalPasscodeEnabled: true,
      })
    );
  });

  it("4) clearPasscode rejects invalid app password", async () => {
    jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue({ _id: "u1", password: "hash" } as any);
    jest.spyOn(bcryptjs, "compare").mockResolvedValue(false as never);

    await expect(service.clearPasscode("u1", "WrongPass")).rejects.toMatchObject({
      statusCode: 401,
      message: "Invalid password",
    });
  });

});

