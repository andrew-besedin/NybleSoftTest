import { DataSource } from "typeorm";
import UsersInfo from "./entities/user-entity";
import dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    entities: [UsersInfo]
});

AppDataSource.initialize().catch((err: Error): void => console.error(err));

export default AppDataSource;