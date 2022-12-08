import { Router } from "express";
import dataController from "../controllers/data.controller";

const dataRouter = new (Router as any)();

dataRouter.post("/info", dataController.getUserInfo);
dataRouter.put("/image", dataController.uploadImage);
dataRouter.post("/pdf", dataController.generatePdf);
dataRouter.put("/rename", dataController.changeName);
dataRouter.delete("/delete", dataController.deleteUser);

export default dataRouter;