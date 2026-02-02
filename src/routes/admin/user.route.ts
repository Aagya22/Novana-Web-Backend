import { Router } from "express";
import { AdminUserController } from "../../controller/admin/user.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";
import { uploads } from "../../middleware/upload.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); // apply all with middleware
router.use(adminMiddleware); // apply all with middleware
router.get("/api/admin/users", adminUserController.getAllUsers);

router.post("/", uploads.single("image"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploads.single("image"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;