import { Router } from "express";
import { HabitController } from "../controller/habit.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const habitController = new HabitController();

router.post("/", authorizedMiddleware, (req, res) => habitController.createHabit(req, res));
router.get("/", authorizedMiddleware, (req, res) => habitController.getHabits(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => habitController.getHabit(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => habitController.updateHabit(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => habitController.deleteHabit(req, res));
router.patch("/:id/complete", authorizedMiddleware, (req, res) => habitController.markCompleted(req, res));

export default router;