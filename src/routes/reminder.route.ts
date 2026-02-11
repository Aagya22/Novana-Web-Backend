import { Router } from "express";
import { ReminderController } from "../controller/reminder.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const reminderController = new ReminderController();

router.post("/", authorizedMiddleware, (req, res) => reminderController.createReminder(req, res));
router.get("/", authorizedMiddleware, (req, res) => reminderController.getReminders(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => reminderController.getReminder(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => reminderController.updateReminder(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => reminderController.deleteReminder(req, res));
router.patch("/:id/toggle", authorizedMiddleware, (req, res) => reminderController.toggleDone(req, res));

export default router;