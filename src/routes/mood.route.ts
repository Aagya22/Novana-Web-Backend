import { Router } from "express";
import { MoodController } from "../controller/mood.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const moodController = new MoodController();

router.post("/", authorizedMiddleware, (req, res) => moodController.createMood(req, res));
router.get("/", authorizedMiddleware, (req, res) => moodController.getMoods(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => moodController.getMood(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => moodController.updateMood(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => moodController.deleteMood(req, res));

export default router;