import { Router } from "express";
import dataController from "../controllers/data.controller";

const dataRouter = new (Router as any)();

dataRouter.post("/get-user-info", dataController.getUserInfo);
dataRouter.put("/upload-image", dataController.uploadImage);
dataRouter.post("/generate-pdf", dataController.generatePdf);
dataRouter.put("/change-name", dataController.changeName);

export default dataRouter;