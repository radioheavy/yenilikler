import { Repository } from "typeorm";
import { CurrencyData } from "../entities/CurrencyData";
import { ShareDetails } from "../entities/ShareDetails";

export class CurrencyDataService {
  private currencyDataRepository: Repository<CurrencyData>;
  private shareDetailsRepository: Repository<ShareDetails>;

  constructor(
    currencyDataRepository: Repository<CurrencyData>,
    shareDetailsRepository: Repository<ShareDetails>
  ) {
    this.currencyDataRepository = currencyDataRepository;
    this.shareDetailsRepository = shareDetailsRepository;
  }

  async createCurrencyData(data: Partial<CurrencyData>): Promise<CurrencyData> {
    const currencyData = this.currencyDataRepository.create(data);
    await this.currencyDataRepository.save(currencyData);
    return currencyData;
  }

  async getCurrencyData(id: number): Promise<CurrencyData | null> {
    return this.currencyDataRepository.findOne({
      where: { id },
      relations: ['campaign']
    });
  }

  async updateCurrencyData(id: number, data: Partial<CurrencyData>): Promise<CurrencyData | null> {
    await this.currencyDataRepository.update(id, data);
    return this.getCurrencyData(id);
  }

  async deleteCurrencyData(id: number): Promise<void> {
    await this.currencyDataRepository.delete(id);
  }

  async calculateInflationAdjustedValues(id: number): Promise<{ TRY: number, USD: number, EUR: number }> {
    const currencyData = await this.getCurrencyData(id);
    const shareDetails = await this.shareDetailsRepository.findOne({ where: { campaign: { id: currencyData?.campaign.id } } });
    if (!currencyData || !shareDetails) {
      throw new Error("Currency data or share details not found");
    }
    const usdChange = (currencyData.currentUSDRate - currencyData.startDateUSDRate) / currencyData.startDateUSDRate;
    const eurChange = (currencyData.currentEURRate - currencyData.startDateEURRate) / currencyData.startDateEURRate;
    const tryInflation = shareDetails.distributionSharePriceTRY + (shareDetails.distributionSharePriceTRY * (usdChange + eurChange) / 2);
    const usdInflation = shareDetails.distributionSharePriceUSD + (shareDetails.distributionSharePriceUSD * usdChange);
    const eurInflation = shareDetails.distributionSharePriceEUR + (shareDetails.distributionSharePriceEUR * eurChange);
    return {
      TRY: tryInflation,
      USD: usdInflation,
      EUR: eurInflation
    };
  }

  async calculateCurrencyChangeRates(id: number): Promise<{ USD: number, EUR: number }> {
    const currencyData = await this.getCurrencyData(id);
    if (!currencyData) {
      throw new Error("Currency data not found");
    }
    return {
      USD: currencyData.currentUSDRate / currencyData.startDateUSDRate,
      EUR: currencyData.currentEURRate / currencyData.startDateEURRate
    };
  }

  async calculateDistributionSharePrices(id: number): Promise<{ USD: number, EUR: number }> {
    const currencyData = await this.getCurrencyData(id);
    const shareDetails = await this.shareDetailsRepository.findOne({ where: { campaign: { id: currencyData?.campaign.id } } });
    if (!currencyData || !shareDetails) {
      throw new Error("Currency data or share details not found");
    }
    const usdPrice = shareDetails.distributionSharePriceTRY / currencyData.startDateUSDRate;
    const eurPrice = shareDetails.distributionSharePriceTRY / currencyData.startDateEURRate;
    return { USD: usdPrice, EUR: eurPrice };
  }

  async getCurrentExchangeRates(id: number): Promise<{ USD: number, EUR: number }> {
    const currencyData = await this.getCurrencyData(id);
    if (!currencyData) {
      throw new Error("Currency data not found");
    }
    return { USD: currencyData.currentUSDRate, EUR: currencyData.currentEURRate };
  }
}