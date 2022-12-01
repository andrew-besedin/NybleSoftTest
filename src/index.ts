import express, { Express, Request, Response } from "express";

const app: Express = express();

app.get("/", (req: Request, res: Response): void => {
    res.send("Hello World1");
});

app.listen(3000, (): void => {
    console.log("Application has started.");
});