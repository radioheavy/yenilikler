import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { Campaign } from "./Campaign";

@Entity()
export class Company {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    facebookLink: string;

    @Column({ nullable: true })
    instagramLink: string;

    @Column({ nullable: true })
    linkedinLink: string;

    @Column({ nullable: true })
    twitterLink: string;

    @Column({ nullable: true })
    fundingPageLink: string;

    @Column({ nullable: true })
    websiteLink: string;

    @OneToOne(() => Campaign, campaign => campaign.company)
    @JoinColumn()
    campaign: Campaign;
}