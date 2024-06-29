// src/services/DatesService.ts

import { Repository } from 'typeorm';
import { Dates } from '../entities/Dates';

export class DatesService {
  private datesRepository: Repository<Dates>;

  constructor(datesRepository: Repository<Dates>) {
    this.datesRepository = datesRepository;
  }

  async createDates(data: Partial<Dates>): Promise<Dates> {
    const dates = this.datesRepository.create(data);
    await this.datesRepository.save(dates);
    return dates;
  }

  async getDates(id: number): Promise<Dates | null> {
    return this.datesRepository.findOne({
      where: { id },
      relations: ['campaign'],
    });
  }

  async updateDates(id: number, data: Partial<Dates>): Promise<Dates | null> {
    await this.datesRepository.update(id, data);
    return this.getDates(id);
  }

  async deleteDates(id: number): Promise<void> {
    await this.datesRepository.delete(id);
  }

  async calculateCampaignDuration(id: number): Promise<number> {
    const dates = await this.getDates(id);
    if (!dates) {
      throw new Error('Dates not found');
    }
    const duration = dates.endDate.getTime() - dates.startDate.getTime();
    return Math.ceil(duration / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  }
}
