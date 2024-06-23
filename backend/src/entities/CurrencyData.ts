import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class CurrencyData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("decimal", { precision: 10, scale: 2 })
    inflationTRY: number;

    @Column("decimal", { precision: 10, scale: 2 })
    inflationUSD: number;

    @Column("decimal", { precision: 10, scale: 2 })
    inflationEUR: number;

    @Column("decimal", { precision: 10, scale: 4 })
    startDateUSDRate: number;

    @Column("decimal", { precision: 10, scale: 4 })
    startDateEURRate: number;

    @Column("decimal", { precision: 10, scale: 4 })
    usdChangeRate: number;

    @Column("decimal", { precision: 10, scale: 4 })
    eurChangeRate: number;

    @Column("decimal", { precision: 10, scale: 4 })
    currentUSDRate: number;

    @Column("decimal", { precision: 10, scale: 4 })
    currentEURRate: number;

    @OneToOne(() => Campaign, campaign => campaign.currencyData)
    @JoinColumn()
    campaign: Campaign;
}