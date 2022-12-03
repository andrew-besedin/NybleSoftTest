import { DataSource } from "typeorm";
import User from "./entities/user-entity";
import dotenv from "dotenv";
import Codes from "./entities/codes-entity";
import Tokens from "./entities/tokens-entity";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [User, Codes, Tokens]
});

AppDataSource.initialize().catch((err: Error): void => console.error(err));

export default AppDataSource;