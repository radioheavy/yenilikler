import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class ShareDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    shareGroup: string;

    @Column("decimal", { precision: 10, scale: 2 })
    capital: number;

    @Column("decimal", { precision: 10, scale: 2 })
    distributionSharePriceTRY: number;

    @Column("decimal", { precision: 10, scale: 2 })
    distributionSharePriceUSD: number;

    @Column("decimal", { precision: 10, scale: 2 })
    distributionSharePriceEUR: number;

    @OneToOne(() => Campaign, campaign => campaign.shareDetails)
    @JoinColumn()
    campaign: Campaign;
}