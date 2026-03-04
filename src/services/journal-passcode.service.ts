import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/auth.repository";

const userRepository = new UserRepository();

export class JournalPasscodeService {
  async getStatus(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    return {
      enabled: Boolean(user.journalPasscodeEnabled && user.journalPasscodeHash),
    };
  }

  async setPasscode(userId: string, passcode: string, password: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const okPassword = await bcryptjs.compare(password, user.password);
    if (!okPassword) {
      throw new HttpError(401, "Invalid password");
    }

    const hash = await bcryptjs.hash(passcode, 10);

    await userRepository.updateJournalPasscode(userId, {
      journalPasscodeHash: hash,
      journalPasscodeEnabled: true,
      journalPasscodeUpdatedAt: new Date(),
    });

    return { enabled: true };
  }

  async clearPasscode(userId: string, password: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    const okPassword = await bcryptjs.compare(password, user.password);
    if (!okPassword) {
      throw new HttpError(401, "Invalid password");
    }

    await userRepository.updateJournalPasscode(userId, {
      journalPasscodeHash: null,
      journalPasscodeEnabled: false,
      journalPasscodeUpdatedAt: new Date(),
    });

    return { enabled: false };
  }

  async verifyPasscode(userId: string, passcode: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, "User not found");

    if (!user.journalPasscodeEnabled || !user.journalPasscodeHash) {
      throw new HttpError(400, "Journal passcode is not enabled");
    }

    const ok = await bcryptjs.compare(passcode, user.journalPasscodeHash);
    if (!ok) {
      throw new HttpError(401, "Invalid passcode");
    }

    const expiresIn = 60 * 30; // 30 minutes
    const token = jwt.sign(
      {
        id: user._id,
        type: "journal_access",
      },
      JWT_SECRET,
      { expiresIn }
    );

    return {
      token,
      expiresInSeconds: expiresIn,
    };
  }
}
