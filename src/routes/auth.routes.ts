import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = new (Router as any)();

authRouter.post("/register-user", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.get("/verify-auth", authController.verifyAuth);
authRouter.get("/get-auth-token", authController.getAuthToken);

export default authRouter;
