import { CreateUserDTO, UpdateUserDto } from "../../dtos/user.dto";
import { Request, Response, NextFunction } from "express";
import { AdminUserService } from "../../services/admin/user.service";

const adminUserService = new AdminUserService();

export class AdminUserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedData = CreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          errors: parsedData.error.flatten(),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      // Admin-created users must never be created as admin.
      (parsedData.data as any).role = "user";

      const newUser = await adminUserService.createUser(parsedData.data);

      return res.status(201).json({
        success: true,
        message: "User Created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await adminUserService.getAllUsersWithPagination(page, limit, search);

      return res.status(200).json({
        success: true,
        message: "All Users Retrieved",
        data: result.users,
        pagination: {
          page: result.page,
          limit: limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await adminUserService.getUserById(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Single User Retrieved",
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const parsedData = UpdateUserDto.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          errors: parsedData.error.flatten(),
        });
      }

      if (req.file) {
        parsedData.data.imageUrl = `/uploads/${req.file.filename}`;
      }

      // Admin must never change a user's role via this endpoint.
      delete (parsedData.data as any).role;

      const updatedUser = await adminUserService.updateUser(
        req.params.id,
        parsedData.data
      );

      return res.status(200).json({
        success: true,
        message: "User Updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const deleted = await adminUserService.deleteUser(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "User Deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
