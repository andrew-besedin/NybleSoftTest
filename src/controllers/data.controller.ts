import { Request, Response } from "express"
import AppDataSource from "../datasource";
import Codes from "../entities/codes-entity";
import Tokens from "../entities/tokens-entity";
import User from "../entities/user-entity";
import dotenv from "dotenv";
import fs from "fs";
import PDFDocument from "pdfkit";
import blobStream from "blob-stream";

dotenv.config();

const userRepository = AppDataSource.getRepository(User);
const codesRepository = AppDataSource.getRepository(Codes);
const tokensRepository = AppDataSource.getRepository(Tokens);


class DataController {
    async getUserInfo (req: Request, res: Response): Promise<void> {
        if (!req.body.token) {
            res.send({ ok: false, message: "invalidInput" });
            return;
        }
        try {
            const tokenRow: Tokens | null = await tokensRepository.findOne({ where: { token: req.body.token } });
            if (!tokenRow) {
                res.send({ ok: false, message: "invalidToken" });
                return;
            }
            const userRow: User | null = await userRepository.findOne({ where: {id: tokenRow!.userId} });
            res.send({ ok: true, data: { firstName: userRow!.firstName, lastName: userRow!.lastName, email: userRow!.email } });
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
    }
    
    async uploadImage (req: Request, res: Response): Promise<void> {
        if (!(req.body.token && req.body.img)) {
            res.send({ ok: false, message: "invalidRequest" });
            return;
        }
        try {
            const tokenRow: Tokens | null = await tokensRepository.findOne({ where: { token: req.body.token } });
            if (!tokenRow) {
                res.send({ ok: false, message: "invalidToken" });
                return;
            }
            await userRepository.save({ id: tokenRow.userId, image: req.body.img });
            res.send({ ok: true });
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
    }

    async generatePdf (req: Request, res: Response): Promise<void> {
        if (!req.body.email) {
            res.send({ ok: "false", message: "invalidInput" });
            return;
        }
        let userRow: User | null;
        try {
            userRow = await userRepository.findOne({ where: { email: req.body.email } });
            if (!userRow) {
                res.send({ ok: false, message: "noSuchEmail" });
                return;
            }
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "dbError" });
            return;
        }
        try {
            const doc = new PDFDocument();
            const stream = doc.pipe(blobStream());
            doc.fontSize(25)
                .text(userRow!.firstName + " " + userRow!.lastName);
            if (!userRow?.image){ 
                doc.text("No Image"); 
            } else {
                doc.image(userRow!.image, {
                    fit: [400, 400],
                    align: 'center',
                    valign: 'center'
                });
            }
            doc.end();
            stream.on("finish", async (): Promise<void> => {
                const blob = stream.toBlob('application/pdf');
                try {
                    await userRepository.save({ id: userRow!.id, pdf: blob });
                    res.send({ ok: true, pdf: await blob.text() });
                } catch(err: any) {
                    fs.appendFileSync("./error.txt", err.toString() + "\r\n");
                    res.send({ ok: false, message: "dbError" });
                    return;
                }
            });
        } catch(err: any) {
            fs.appendFileSync("./error.txt", err.toString() + "\r\n");
            res.send({ ok: false, message: "pdfGenerationError" });
            return;
        }
    }
}

const dataController = new DataController();

export default dataController;