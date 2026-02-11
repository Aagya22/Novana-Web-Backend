import { Router } from "express";
import { ExerciseController } from "../controller/exercise.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const exerciseController = new ExerciseController();

router.post("/", authorizedMiddleware, (req, res) => exerciseController.createExercise(req, res));
router.get("/", authorizedMiddleware, (req, res) => exerciseController.getExercises(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => exerciseController.getExercise(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => exerciseController.updateExercise(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => exerciseController.deleteExercise(req, res));

export default router;