import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import AppDataSource from "./datasource";
import User from "./entities/user-entity";
import Codes from "./entities/codes-entity";
import Tokens from "./entities/tokens-entity";
import nodemailer from "nodemailer";
import makeCode from "./make-code";
import { CronJob } from "cron";
import fs from "fs";


dotenv.config();

const userRepository = AppDataSource.getRepository(User);
const codesRepository = AppDataSource.getRepository(Codes);
const tokensRepository = AppDataSource.getRepository(Tokens);

const app: Express = express();

app.use(express.json());

app.post("/register-user", async (req: Request, res: Response): Promise<void> => {
    if (!(req.body.firstName && req.body.lastName && req.body.email)) { 
        res.send({ ok: false, message: "invalidRequest" }); 
        return; 
    }
    try {
        if (await userRepository.findOne({ where: { email: req.body.email }})) {
            res.send({ ok: false, message: "emailExists" }); 
            return;
        }
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "dbError" });
        return;
    }
    const verificationCode: string = makeCode(12);
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        let info = await transporter.sendMail({
            from: `"NybleSoftTest Mail" <${process.env.EMAIL_USER}>`, 
            to: req.body.email, 
            subject: "Registation verification", 
            html: `<b>Hello. </b><a href="http://${req.headers.host}/verify-registration?code=${verificationCode}">Click here to verify email</a>`, 
        });
        if (info.response.split(" ")[0] != "250") throw new Error("Message send error (SMTP code not 250)");
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "emailError" });
        return;
    }
    try {
        const job = new CronJob(new Date(Date.now() + 60 *1e3), async (): Promise<void> => {
            try {
                const codeRow: Codes | null = await codesRepository.findOne({ where: { registerCode: verificationCode } });
                if (codeRow) {
                    await userRepository.delete({ codesId: codeRow.id });
                    await codesRepository.delete({ id: codeRow.id });
                }
            } catch(err: any) {
                fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            }
        });
        job.start();
        await codesRepository.save({ registerCode: verificationCode });
        const userId: string = (await codesRepository.findOne({ where: { registerCode: verificationCode } }))!.id;
        await userRepository.save({ id: userId, firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, codesId: userId});
        res.send({ ok: true });
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "dbError" });
        return;
    }
});

app.get("/verify-registration", async (req: Request, res: Response): Promise<void> => {
    try {
        const codeRow: Codes | null = await codesRepository.findOne({ where: { registerCode: req.query.code?.toString() } });
        if (!codeRow) {
            res.send("Verification failed");
            return;
        } 
        await codesRepository.save({ id: codeRow.id, registerCode: "" });
        res.send("Success");
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send("Error. Try again.");
    } 
});

app.post("/login", async (req: Request, res: Response): Promise<void> => {
    if (!req.body.email) {
        res.send({ ok: false, message: "invalidRequest" });
        return;
    }
    try {
        const userRow: User | null = await userRepository.findOne({ where: { email: req.body.email } });
        if (!userRow) {
            res.send({ ok: false, message: "noSuchEmail" });
            return;
        }
        if ((await codesRepository.findOne({ where: { id: userRow.codesId } }))!.registerCode) {
            res.send({ ok: false, message: "accountNotActivated" });
            return;
        }
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "dbError" });
        return;
    }
    const verificationCode: string = makeCode(12);
    const token: string = makeCode(24);
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        let info = await transporter.sendMail({
            from: `"NybleSoftTest Mail" <${process.env.EMAIL_USER}>`, 
            to: req.body.email, 
            subject: "Login verification", 
            html: `<b>Hello. </b><a href="http://${req.headers.host}/verify-login?code=${verificationCode}">Click here to log in</a>`, 
        });
        if (info.response.split(" ")[0] != "250") throw new Error("Message send error (SMTP code not 250)");
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "emailError" });
        return;
    }
    try {
        const job = new CronJob(new Date(Date.now() + 24 * 60 * 60 * 1e3), async () => {
            await tokensRepository.delete({ token: token });
        });
        job.start();
        const userRow: User | null = await userRepository.findOne({ where: { email: req.body.email } });
        await tokensRepository.save({ loginCode: verificationCode, token: token, userId: userRow?.id });
        res.send({ ok: true })
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "dbError" });
        return;
    }
});

app.get("/verify-login", async (req: Request, res: Response): Promise<void> => {
    res.sendFile(__dirname + "/assets/verify-login.html");
});

app.get("/get-login-token", async(req: Request, res: Response): Promise<void> => {
    try {
        const tokenRow: Tokens | null = await tokensRepository.findOne({ where: { loginCode: req.query.code?.toString() } });
        if (!tokenRow) {
            res.send({ ok: false, message: "invalidCode" });
            return;
        }
        res.send({ ok: true, token: tokenRow.token });
        await tokensRepository.save({ id: tokenRow.id, loginCode: "" });
    } catch(err: any) {
        fs.appendFileSync("./error.txt", err.toString() + "\r\n");
        res.send({ ok: false, message: "dbError" });
        return;
    }
});

app.listen(Number(process.env.APP_PORT) || 3000, (): void => {
    console.log("Application has been started.");
});