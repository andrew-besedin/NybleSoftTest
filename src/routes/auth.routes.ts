import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRouter = new (Router as any)();

authRouter.post("/register", authController.registerUser);
authRouter.post("/login", authController.loginUser);
authRouter.get("/verify", authController.verifyAuth);
authRouter.get("/token", authController.getAuthToken);

export default authRouter;
