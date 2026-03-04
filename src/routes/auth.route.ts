import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { JournalPasscodeController } from "../controller/journal-passcode.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import {  uploads } from "../middleware/upload.middleware";

const router = Router();
const authController = new AuthController();
const journalPasscodeController = new JournalPasscodeController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

router.get('/whoami', authorizedMiddleware, (req, res) => authController.getUserProfile(req, res));

router.put(
    '/update-profile',
    authorizedMiddleware,
    uploads.single('image'), // expecting a single file with field name 'image' key in form-data
    (req, res) => authController.updateUser(req, res)
)
router.post("/request-password-reset", authController.sendResetPasswordEmail);
router.post("/reset-password/:token", authController.resetPassword);

router.get("/journal-passcode", authorizedMiddleware, (req, res) => journalPasscodeController.status(req, res));
router.put("/journal-passcode", authorizedMiddleware, (req, res) => journalPasscodeController.set(req, res));
router.delete("/journal-passcode", authorizedMiddleware, (req, res) => journalPasscodeController.clear(req, res));
router.post("/journal-passcode/verify", authorizedMiddleware, (req, res) => journalPasscodeController.verify(req, res));

export default router;