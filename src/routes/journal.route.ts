import { Router } from "express";
import { JournalController } from "../controller/journal.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { journalPasscodeMiddleware } from "../middleware/journal-passcode.middleware";

const router = Router();
const journalController = new JournalController();

router.post("/", authorizedMiddleware, journalPasscodeMiddleware, (req, res) => journalController.createJournal(req, res));
router.get("/", authorizedMiddleware, journalPasscodeMiddleware, (req, res) => journalController.getJournals(req, res));
router.get("/:id", authorizedMiddleware, journalPasscodeMiddleware, (req, res) => journalController.getJournal(req, res));
router.put("/:id", authorizedMiddleware, journalPasscodeMiddleware, (req, res) => journalController.updateJournal(req, res));
router.delete("/:id", authorizedMiddleware, journalPasscodeMiddleware, (req, res) => journalController.deleteJournal(req, res));

export default router;