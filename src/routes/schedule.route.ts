import { Router } from "express";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { ScheduleController } from "../controller/schedule.controller";

const router = Router();
const scheduleController = new ScheduleController();

router.post("/", authorizedMiddleware, (req, res) => scheduleController.createSchedule(req, res));
router.get("/", authorizedMiddleware, (req, res) => scheduleController.getSchedules(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => scheduleController.getSchedule(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => scheduleController.updateSchedule(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => scheduleController.deleteSchedule(req, res));

export default router;
