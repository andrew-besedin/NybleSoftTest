import { Router } from "express";
import dataController from "../controllers/data.controller";

const router = new (Router as any)();

router.post("/get-user-info", dataController.getUserInfo);
router.put("/upload-image", dataController.uploadImage);
router.post("/generate-pdf", dataController.generatePdf);

export default router;