import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class InvestorStats {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    totalInvestors: number;

    @Column()
    qualifiedInvestors: number;

    @Column()
    nonQualifiedInvestors: number;

    @OneToOne(() => Campaign, campaign => campaign.investorStats)
    @JoinColumn()
    campaign: Campaign;
}