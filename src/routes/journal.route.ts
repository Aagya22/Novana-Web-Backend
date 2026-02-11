import { Router } from "express";
import { JournalController } from "../controller/journal.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";

const router = Router();
const journalController = new JournalController();

router.post("/", authorizedMiddleware, (req, res) => journalController.createJournal(req, res));
router.get("/", authorizedMiddleware, (req, res) => journalController.getJournals(req, res));
router.get("/:id", authorizedMiddleware, (req, res) => journalController.getJournal(req, res));
router.put("/:id", authorizedMiddleware, (req, res) => journalController.updateJournal(req, res));
router.delete("/:id", authorizedMiddleware, (req, res) => journalController.deleteJournal(req, res));

export default router;