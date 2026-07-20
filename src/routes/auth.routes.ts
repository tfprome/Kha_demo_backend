import { Router } from "express";
import * as authController from "../controller/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
//console.log("📦 auth.routes.ts file has been loaded!");

router.post('/register', authController.register);
router.post('/login', authController.login)

router.post('/refresh', authController.refreshToken)

router.post('/me', authenticate, authController.getMe)

router.post('/logout', authenticate, authController.logout)

export default router;