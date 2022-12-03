import { Request, Response } from "express"
import AppDataSource from "../datasource";
import Codes from "../entities/codes-entity";
import Tokens from "../entities/tokens-entity";
import User from "../entities/user-entity";
import dotenv from "dotenv";
import fs from "fs";

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
}

const dataController = new DataController();

export default dataController;