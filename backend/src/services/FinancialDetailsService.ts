import { Repository } from "typeorm";
import { FinancialDetails } from "../entities/FinancialDetails";
import { InvestorStats } from "../entities/InvestorStats";
import { CurrencyData } from "../entities/CurrencyData";
import { Campaign } from "../entities/Campaign";

export class FinancialDetailsService {
  private financialDetailsRepository: Repository<FinancialDetails>;
  private investorStatsRepository: Repository<InvestorStats>;
  private currencyDataRepository: Repository<CurrencyData>;
  private campaignRepository: Repository<Campaign>;

  constructor(
    financialDetailsRepository: Repository<FinancialDetails>,
    investorStatsRepository: Repository<InvestorStats>,
    currencyDataRepository: Repository<CurrencyData>,
    campaignRepository: Repository<Campaign>
  ) {
    this.financialDetailsRepository = financialDetailsRepository;
    this.investorStatsRepository = investorStatsRepository;
    this.currencyDataRepository = currencyDataRepository;
    this.campaignRepository = campaignRepository;
  }

  async createFinancialDetails(data: Partial<FinancialDetails>): Promise<FinancialDetails> {
    const financialDetails = this.financialDetailsRepository.create(data);
    await this.financialDetailsRepository.save(financialDetails);
    return financialDetails;
  }

  async getFinancialDetails(id: number): Promise<FinancialDetails | null> {
    return this.financialDetailsRepository.findOne({
      where: { id },
      relations: ['campaign']
    });
  }

  async updateFinancialDetails(id: number, data: Partial<FinancialDetails>): Promise<FinancialDetails | null> {
    await this.financialDetailsRepository.update(id, data);
    return this.getFinancialDetails(id);
  }

  async deleteFinancialDetails(id: number): Promise<void> {
    await this.financialDetailsRepository.delete(id);
  }

  async calculateRealizationRate(id: number): Promise<number> {
    const financialDetails = await this.getFinancialDetails(id);
    if (!financialDetails) {
      throw new Error("Financial details not found");
    }
    return 1 - (financialDetails.targetAmount - financialDetails.raisedAmount) / financialDetails.targetAmount;
  }

  async calculateAverageInvestmentAmount(id: number): Promise<number> {
    const financialDetails = await this.getFinancialDetails(id);
    const investorStats = await this.investorStatsRepository.findOne({ where: { campaign: { id: financialDetails?.campaign.id } } });
    if (!financialDetails || !investorStats) {
      throw new Error("Financial details or investor stats not found");
    }
    const totalInvestors = investorStats.qualifiedInvestors + investorStats.nonQualifiedInvestors;
    return financialDetails.raisedAmount / totalInvestors;
  }

  async calculateExtraFundingAmount(id: number): Promise<number> {
    const financialDetails = await this.getFinancialDetails(id);
    if (!financialDetails) {
      throw new Error("Financial details not found");
    }
    return Math.max(0, financialDetails.raisedAmount - financialDetails.targetAmount);
  }

  async calculateRemainingFundingAmount(id: number): Promise<number> {
    const financialDetails = await this.getFinancialDetails(id);
    if (!financialDetails) {
      throw new Error("Financial details not found");
    }
    return Math.max(0, financialDetails.targetAmount - financialDetails.raisedAmount);
  }

  async calculateValuation(id: number): Promise<{ TRY: number, USD: number, EUR: number }> {
    const financialDetails = await this.getFinancialDetails(id);
    if (!financialDetails) {
      throw new Error("Financial details not found");
    }
    
    const campaign = await this.campaignRepository.findOne({
      where: { id: financialDetails.campaign.id }
    });
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    
    const currencyData = await this.currencyDataRepository.findOne({
      where: { campaign: { id: campaign.id } }
    });
    if (!currencyData) {
      throw new Error("Currency data not found");
    }
    
    const valuationTRY = financialDetails.targetAmount / (campaign.offerRatio / 100);
    const valuationUSD = valuationTRY / currencyData.startDateUSDRate;
    const valuationEUR = valuationTRY / currencyData.startDateEURRate;
    
    return { TRY: valuationTRY, USD: valuationUSD, EUR: valuationEUR };
  }
}