// src/services/InvestorStatsService.ts

import { Repository } from 'typeorm';
import { InvestorStats } from '../entities/InvestorStats';

export class InvestorStatsService {
  private investorStatsRepository: Repository<InvestorStats>;

  constructor(investorStatsRepository: Repository<InvestorStats>) {
    this.investorStatsRepository = investorStatsRepository;
  }

  async createInvestorStats(data: Partial<InvestorStats>): Promise<InvestorStats> {
    const investorStats = this.investorStatsRepository.create(data);
    await this.investorStatsRepository.save(investorStats);
    return investorStats;
  }

  async getInvestorStats(id: number): Promise<InvestorStats | null> {
    return this.investorStatsRepository.findOne({
      where: { id },
      relations: ['campaign'],
    });
  }

  async updateInvestorStats(
    id: number,
    data: Partial<InvestorStats>,
  ): Promise<InvestorStats | null> {
    await this.investorStatsRepository.update(id, data);
    return this.getInvestorStats(id);
  }

  async deleteInvestorStats(id: number): Promise<void> {
    await this.investorStatsRepository.delete(id);
  }

  async calculateTotalInvestors(id: number): Promise<number> {
    const stats = await this.getInvestorStats(id);
    if (!stats) {
      throw new Error('Investor stats not found');
    }
    return stats.qualifiedInvestors + stats.nonQualifiedInvestors;
  }

  async calculateQualifiedInvestorPercentage(id: number): Promise<number> {
    const stats = await this.getInvestorStats(id);
    if (!stats) {
      throw new Error('Investor stats not found');
    }
    const total = stats.qualifiedInvestors + stats.nonQualifiedInvestors;
    return (stats.qualifiedInvestors / total) * 100;
  }
}
