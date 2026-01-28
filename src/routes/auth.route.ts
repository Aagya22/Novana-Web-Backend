import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authorizedMiddleware } from "../middleware/authorized.middleware";
import { upload, uploads } from "../middleware/upload.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get('/whoami', authorizedMiddleware,  authController.getUserProfile);

router.put(
    '/update-profile',
    authorizedMiddleware,
    uploads.single('image'), // expecting a single file with field name 'image' key in form-data
    authController.updateUser
)

export default router;