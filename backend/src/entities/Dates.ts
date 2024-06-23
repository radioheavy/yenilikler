import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class Dates {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("date")
    startDate: Date;

    @Column("date")
    endDate: Date;

    @OneToOne(() => Campaign, campaign => campaign.dates)
    @JoinColumn()
    campaign: Campaign;
}