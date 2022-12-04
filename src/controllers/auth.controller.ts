import { Request, Response } from "express";
import * as dotenv from "dotenv";
import AppDataSource from "./../datasource";
import User from "./../entities/user-entity";
import Codes from "./../entities/codes-entity";
import Tokens from "./../entities/tokens-entity";
import nodemailer from "nodemailer";
import makeCode from "./../make-code";
import { CronJob } from "cron";
import fs from "fs";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);
const codesRepository = AppDataSource.getRepository(Codes);
const tokensRepository = AppDataSource.getRepository(Tokens);

const job = new CronJob("0 * * * * *", async (): Promise<void> => {
    const tokenRows: Tokens[] | null = await tokensRepository.find();
    tokenRows.forEach(async row => {
        if ((Number(row.loginTimeout) < Date.now() && row.loginTimeout != "") || (Number(row.tokenTimeout) < Date.now() && row.tokenTimeout != "")) {
            try {
                await tokensRepository.delete({ id: row.id });
            } catch(err: any) {
                fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            }
        }
    });
    const codeRows: Codes[] | null = await codesRepository.find();
    codeRows.forEach(async row => {
        if (Number(row.resgistrationTimeout) < Date.now() && row.registerCode || "") {
            try {
                await userRepository.delete({ codesId: row.id });
                await codesRepository.delete({ id: row.id });
            } catch(err: any) {
                fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            }
        }
    });
});

job.start();

class AuthController {
    async registerUser (req: Request, res: Response): Promise<void> {
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
                html: `<b>Hello. </b><a href="http://${req.headers.host}/api/auth/verify-auth?type=reg&code=${verificationCode}">Click here to verify email</a>`, 
            });
            if (info.response.split(" ")[0] != "250") throw new Error("Message send error (SMTP code not 250)");
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "emailError" });
            return;
        }
        try {
            await codesRepository.save({ registerCode: verificationCode, resgistrationTimeout: (Date.now() + 30 * 60 * 1e3).toString() });
            const userId: string = (await codesRepository.findOne({ where: { registerCode: verificationCode } }))!.id;
            await userRepository.save({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, codesId: userId});
            res.send({ ok: true });
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
    }

    async loginUser (req: Request, res: Response): Promise<void> {
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
                html: `<b>Hello. </b><a href="http://${req.headers.host}/api/auth/verify-auth?type=login&code=${verificationCode}">Click here to log in</a>`, 
            });
            if (info.response.split(" ")[0] != "250") throw new Error("Message send error (SMTP code not 250)");
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "emailError" });
            return;
        }
        try {
            const userRow: User | null = await userRepository.findOne({ where: { email: req.body.email } });
            await tokensRepository.save({ loginCode: verificationCode, loginTimeout: (Date.now() + 60 * 1e3).toString(), token: token, tokenTimeout: (Date.now() + 24 * 60 * 60 * 1e3).toString(), userId: userRow?.id });
            res.send({ ok: true })
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
    }

    async verifyAuth (req: Request, res: Response): Promise<void> {
        let pathArray: string[] = __dirname.split("\\")
        pathArray.pop();
        res.sendFile(pathArray.join("\\") + "/assets/verify-auth.html");
    }

    async getAuthToken (req: Request, res: Response): Promise<void> {
        if (!(req.query.type && req.query.code)) {
            res.send({ ok: false, message: "invalidInput" });
            return;
        }
        try {
            if (req.query.type == "login") {
                const tokenRow: Tokens | null = await tokensRepository.findOne({ where: { loginCode: req.query.code!.toString() } });
                if (!tokenRow) {
                    res.send({ ok: false, message: "invalidCode" });
                    return;
                }
                res.send({ ok: true, token: tokenRow.token });
                await tokensRepository.save({ id: tokenRow.id, loginCode: "", loginTimeout: "" });
                return;
            }
            if (req.query.type == "reg") {
                const codesRow: Codes | null = await codesRepository.findOne({ where: { registerCode: req.query.code!.toString() } });
                if (!codesRow) {
                    res.send({ ok: false, message: "invalidCode" });
                    return;
                }
                const token: string = makeCode(24);
                await tokensRepository.save({ loginCode: "", loginTimeout: "", token: token, tokenTimeout: (Date.now() + 24 * 60 * 60 * 1e3).toString(), userId: (await userRepository.findOne({ where: { codesId: codesRow.id } }))!.id });
                res.send({ ok: true, token: token });
                await codesRepository.save({ id: codesRow.id, registerCode: "", resgistrationTimeout: "" });
                return;
            }
            res.send({ ok: false, message: "invalidType" });
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
    }
}

const authController = new AuthController();

export default authController;