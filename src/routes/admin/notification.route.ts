import { Router } from "express";
import { AdminNotificationController } from "../../controller/admin/notification.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middleware/authorized.middleware";

const controller = new AdminNotificationController();
const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", controller.getNotifications.bind(controller));
router.patch("/read-all", controller.markAllRead.bind(controller));
router.patch("/:id/read", controller.markRead.bind(controller));
router.delete("/", controller.clearAll.bind(controller));

export default router;
