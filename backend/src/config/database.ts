import { DataSourceOptions } from "typeorm";
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Campaign } from "../entities/Campaign";
import { Company } from "../entities/Company";
import { CurrencyData } from "../entities/CurrencyData";
import { Dates } from "../entities/Dates";
import { FinancialDetails } from "../entities/FinancialDetails";
import { InvestorStats } from "../entities/InvestorStats";
import { ShareDetails } from "../entities/ShareDetails";

dotenv.config();

const config: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Campaign, Company, CurrencyData,Dates, FinancialDetails,InvestorStats, ShareDetails],
  synchronize: true,
  logging: false
};

export default config;
