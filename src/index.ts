import express, { Express } from "express";
import * as dotenv from "dotenv";
import authRouter from "./routes/auth.routes";
import dataRouter from "./routes/data.routes";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.use("/", authRouter);
app.use("/", dataRouter);

app.listen(Number(process.env.APP_PORT) || 3000, (): void => {
    console.log("Application has been started.");
});