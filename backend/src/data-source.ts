import { DataSource } from "typeorm"
import { User } from "./entities/User"
import dotenv from 'dotenv'
import { Campaign } from "./entities/Campaign";
import { Company } from "./entities/Company";
import { CurrencyData } from "./entities/CurrencyData";
import { Dates } from "./entities/Dates";
import { FinancialDetails } from "./entities/FinancialDetails";
import { InvestorStats } from "./entities/InvestorStats";
import { ShareDetails } from "./entities/ShareDetails";

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
    entities: [User, Campaign, Company, CurrencyData,Dates, FinancialDetails,InvestorStats, ShareDetails],
    migrations: [],
    subscribers: [],
})