import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/auth.repository";
import { HttpError } from "../errors/http-error";

const userRepository = new UserRepository();

/* ---------------------------------------------
   Extend Express Request to include user
---------------------------------------------- */
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

/* ---------------------------------------------
   AUTHORIZATION MIDDLEWARE (JWT)
   - Checks token
   - Loads user
   - Attaches req.user
---------------------------------------------- */
export async function authorizedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Authorization header missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new HttpError(401, "Token missing");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    if (!decoded?.id) {
      throw new HttpError(401, "Invalid token");
    }

    const user = await userRepository.getUserById(decoded.id);

    if (!user) {
      throw new HttpError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(err.statusCode ?? 401).json({
      success: false,
      message: err.message || "Unauthorized",
    });
  }
}

/* ---------------------------------------------
   ADMIN GUARD
   - Requires logged in user
   - Requires role === 'admin'
---------------------------------------------- */
export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admins only",
    });
  }

  next();
}
