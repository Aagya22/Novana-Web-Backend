import { Request, Response } from "express";
import {
  JournalPasscodeClearDTO,
  JournalPasscodeSetDTO,
  JournalPasscodeVerifyDTO,
} from "../dtos/journal-passcode.dto";
import { JournalPasscodeService } from "../services/journal-passcode.service";

const journalPasscodeService = new JournalPasscodeService();

export class JournalPasscodeController {
  async status(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const result = await journalPasscodeService.getStatus(userId);
      return res.status(200).json({ success: true, message: "Journal passcode status", data: result });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async set(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const parsed = JournalPasscodeSetDTO.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.issues.map(i => i.message).join(", ");
        return res.status(400).json({ success: false, message: messages });
      }

      const result = await journalPasscodeService.setPasscode(userId, parsed.data.passcode, parsed.data.password);
      return res.status(200).json({ success: true, message: "Journal passcode set", data: result });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async clear(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const parsed = JournalPasscodeClearDTO.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.issues.map(i => i.message).join(", ");
        return res.status(400).json({ success: false, message: messages });
      }

      const result = await journalPasscodeService.clearPasscode(userId, parsed.data.password);
      return res.status(200).json({ success: true, message: "Journal passcode cleared", data: result });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const userId = req.user?._id?.toString();
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const parsed = JournalPasscodeVerifyDTO.safeParse(req.body);
      if (!parsed.success) {
        const messages = parsed.error.issues.map(i => i.message).join(", ");
        return res.status(400).json({ success: false, message: messages });
      }

      const result = await journalPasscodeService.verifyPasscode(userId, parsed.data.passcode);
      return res.status(200).json({ success: true, message: "Journal unlocked", data: result });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
