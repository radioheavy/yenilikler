import { DataSource } from "typeorm"
import { User } from "./entities/User"
import dotenv from 'dotenv'

dotenv.config({ path: '/Users/ismailoktaydak/Developer/kifobu/backend/src/.env' });

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [User],
    migrations: [],
    subscribers: [],
})