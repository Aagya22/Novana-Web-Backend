import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export function journalPasscodeMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const enabled = Boolean(req.user.journalPasscodeEnabled && req.user.journalPasscodeHash);
    if (!enabled) {
      return next();
    }

    const headerValue = req.headers["x-journal-access-token"];
    const token = Array.isArray(headerValue) ? headerValue[0] : headerValue;

    if (!token || typeof token !== "string") {
      return res.status(403).json({
        success: false,
        code: "JOURNAL_PASSCODE_REQUIRED",
        message: "Journal passcode required",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || decoded.type !== "journal_access") {
      return res.status(403).json({
        success: false,
        code: "JOURNAL_PASSCODE_INVALID",
        message: "Journal unlock token invalid",
      });
    }

    const decodedId = String(decoded.id ?? "");
    const userId = req.user._id.toString();

    if (decodedId !== userId) {
      return res.status(403).json({
        success: false,
        code: "JOURNAL_PASSCODE_INVALID",
        message: "Journal unlock token does not match user",
      });
    }

    return next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      code: "JOURNAL_PASSCODE_INVALID",
      message: "Journal unlock token invalid",
    });
  }
}
