import { Repository } from 'typeorm';
import { ShareDetails } from '../entities/ShareDetails';
import { FinancialDetails } from '../entities/FinancialDetails';

export class ShareDetailsService {
  private shareDetailsRepository: Repository<ShareDetails>;
  private financialDetailsRepository: Repository<FinancialDetails>;

  constructor(
    shareDetailsRepository: Repository<ShareDetails>,
    financialDetailsRepository: Repository<FinancialDetails>,
  ) {
    this.shareDetailsRepository = shareDetailsRepository;
    this.financialDetailsRepository = financialDetailsRepository;
  }

  async createShareDetails(data: Partial<ShareDetails>): Promise<ShareDetails> {
    const shareDetails = this.shareDetailsRepository.create(data);
    await this.shareDetailsRepository.save(shareDetails);
    return shareDetails;
  }

  async getShareDetails(id: number): Promise<ShareDetails | null> {
    return this.shareDetailsRepository.findOne({
      where: { id },
      relations: ['campaign'],
    });
  }

  async updateShareDetails(id: number, data: Partial<ShareDetails>): Promise<ShareDetails | null> {
    await this.shareDetailsRepository.update(id, data);
    return this.getShareDetails(id);
  }

  async deleteShareDetails(id: number): Promise<void> {
    await this.shareDetailsRepository.delete(id);
  }

  async calculateSharePriceChange(id: number): Promise<{ USD: number; EUR: number }> {
    const shareDetails = await this.getShareDetails(id);
    if (!shareDetails) {
      throw new Error('Share details not found');
    }
    const usdChange =
      ((shareDetails.distributionSharePriceUSD - shareDetails.distributionSharePriceTRY) /
        shareDetails.distributionSharePriceTRY) *
      100;
    const eurChange =
      ((shareDetails.distributionSharePriceEUR - shareDetails.distributionSharePriceTRY) /
        shareDetails.distributionSharePriceTRY) *
      100;
    return { USD: usdChange, EUR: eurChange };
  }

  async updateCapitalAfterFunding(id: number): Promise<void> {
    const shareDetails = await this.getShareDetails(id);
    const financialDetails = await this.financialDetailsRepository.findOne({
      where: { campaign: { id: shareDetails?.campaign.id } },
    });
    if (!shareDetails || !financialDetails) {
      throw new Error('Share details or financial details not found');
    }
    shareDetails.capital += financialDetails.raisedAmount;
    await this.shareDetailsRepository.save(shareDetails);
  }
}
