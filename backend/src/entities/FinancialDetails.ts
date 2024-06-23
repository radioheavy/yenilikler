import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class FinancialDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    targetAmount: number;

    @Column("decimal", { precision: 10, scale: 2 })
    raisedAmount: number;

    @Column("decimal", { precision: 5, scale: 2 })
    realizationRate: number;

    @Column("decimal", { precision: 10, scale: 2 })
    extraFundingAmount: number;

    @Column("decimal", { precision: 10, scale: 2 })
    remainingFundingAmount: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valuationTRY: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valuationUSD: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valuationEUR: number;

    @Column("decimal", { precision: 10, scale: 2 })
    averageInvestmentAmount: number;

    @OneToOne(() => Campaign, campaign => campaign.financialDetails)
    @JoinColumn()
    campaign: Campaign;
}