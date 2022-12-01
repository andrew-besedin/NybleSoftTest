import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import AppDataSource from "./datasource";
import UsersInfo from "./entities/user-entity";

dotenv.config();

const app: Express = express();

app.get("/", async (req: Request, res: Response): Promise<void> => {
    const userRepository = AppDataSource.getRepository(UsersInfo);
    await userRepository.save({email: "aasdsa", firstName: "Andrei", lastName: "Besedin"});
    res.send("Hello World1");
});

app.listen(Number(process.env.APP_PORT) || 3000, (): void => {
    console.log("Application has started.");
});