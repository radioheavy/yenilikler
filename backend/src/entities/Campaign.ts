import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { FinancialDetails } from './FinancialDetails';
import { Dates } from './Dates';
import { InvestorStats } from './InvestorStats';
import { ShareDetails } from './ShareDetails';
import { CurrencyData } from './CurrencyData';
import { Company } from './Company';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  status: string;

  @Column()
  sector: string;

  @Column()
  platform: string;

  @Column('decimal', { precision: 10, scale: 2 })
  minimumInvestmentAmount: number;

  @Column('decimal', { precision: 5, scale: 2 })
  offerRatio: number;

  @Column('text')
  privileges: string;

  @Column('text')
  commitments: string;

  @Column('text')
  freeShares: string;

  @Column()
  campaignCode: string;

  // İlişkiler
  @OneToOne(() => FinancialDetails, (financialDetails) => financialDetails.campaign)
  financialDetails: FinancialDetails;

  @OneToOne(() => Dates, (dates) => dates.campaign)
  dates: Dates;

  @OneToOne(() => InvestorStats, (investorStats) => investorStats.campaign)
  investorStats: InvestorStats;

  @OneToOne(() => ShareDetails, (shareDetails) => shareDetails.campaign)
  shareDetails: ShareDetails;

  @OneToOne(() => CurrencyData, (currencyData) => currencyData.campaign)
  currencyData: CurrencyData;

  @OneToOne(() => Company, (company) => company.campaign)
  company: Company;
}
