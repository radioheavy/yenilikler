import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Campaign } from './entities/Campaign';
import { Company } from './entities/Company';
import { CurrencyData } from './entities/CurrencyData';
import { Dates } from './entities/Dates';
import { FinancialDetails } from './entities/FinancialDetails';
import { InvestorStats } from './entities/InvestorStats';
import { ShareDetails } from './entities/ShareDetails';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/ismailoktaydak/Developer/kifobu/backend/src/.env' });

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  throw new Error('One or more environment variables are missing for the database configuration.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: [
    User,
    Campaign,
    Company,
    CurrencyData,
    Dates,
    FinancialDetails,
    InvestorStats,
    ShareDetails,
  ],
  migrations: [],
  subscribers: [],
});
