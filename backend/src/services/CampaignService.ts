import { Repository } from "typeorm";
import { Campaign } from "../entities/Campaign";

export class CampaignService {
  private campaignRepository: Repository<Campaign>;

  constructor(campaignRepository: Repository<Campaign>) {
    this.campaignRepository = campaignRepository;
  }

  async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign = this.campaignRepository.create(campaignData);
    await this.campaignRepository.save(campaign);
    return campaign;
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    return this.campaignRepository.findOne({
      where: { id },
      relations: ['financialDetails', 'dates', 'investorStats', 'shareDetails', 'currencyData', 'company']
    });
  }

  async updateCampaign(id: number, campaignData: Partial<Campaign>): Promise<Campaign | null> {
    await this.campaignRepository.update(id, campaignData);
    return this.getCampaign(id);
  }

  async deleteCampaign(id: number): Promise<void> {
    await this.campaignRepository.delete(id);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return this.campaignRepository.find({
      relations: ['financialDetails', 'dates', 'investorStats', 'shareDetails', 'currencyData', 'company']
    });
  }

  async calculateRemainingTime(id: number): Promise<number> {
    const campaign = await this.getCampaign(id);
    if (!campaign || !campaign.dates) {
      throw new Error("Campaign or dates not found");
    }
    const now = new Date();
    const endDate = new Date(campaign.dates.endDate);
    const remainingTime = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24))); // Remaining days
  }

  async checkCampaignStatus(id: number): Promise<string> {
    const campaign = await this.getCampaign(id);
    if (!campaign || !campaign.dates || !campaign.financialDetails) {
      throw new Error("Campaign, dates or financial details not found");
    }
    const now = new Date();
    const endDate = new Date(campaign.dates.endDate);
    if (now > endDate) {
      return campaign.financialDetails.raisedAmount >= campaign.financialDetails.targetAmount ? "Başarılı" : "Başarısız";
    }
    return "Devam Ediyor";
  }
}