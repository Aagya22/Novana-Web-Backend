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
      const users = await adminUserService.getAllUsers();

      return res.status(200).json({
        success: true,
        message: "All Users Retrieved",
        data: users,
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
