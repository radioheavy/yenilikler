import { Request, Response } from 'express';
import { InvestorStatsService } from '../services/InvestorStatsService';
import { AppDataSource } from '../data-source'; // AppDataSource import et
import { InvestorStats } from '../entities/InvestorStats';
import { WebSocketServer } from '../websocket/socketServer';

export class InvestorStatsController {
  private investorStatsService: InvestorStatsService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const investorStatsRepository = AppDataSource.getRepository(InvestorStats); // getRepository değiştir
    this.investorStatsService = new InvestorStatsService(investorStatsRepository);
    this.webSocketServer = webSocketServer;
  }

  async createInvestorStats(req: Request, res: Response): Promise<void> {
    try {
      const investorStats = await this.investorStatsService.createInvestorStats(req.body);
      this.webSocketServer.emit('investorStatsCreated', investorStats);
      res.status(201).json(investorStats);
    } catch (error) {
      res.status(500).json({ message: 'Error creating investor stats', error });
    }
  }

  async getInvestorStats(req: Request, res: Response): Promise<void> {
    try {
      const investorStats = await this.investorStatsService.getInvestorStats(Number(req.params.id));
      if (investorStats) {
        res.json(investorStats);
      } else {
        res.status(404).json({ message: 'Investor stats not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving investor stats', error });
    }
  }

  async updateInvestorStats(req: Request, res: Response): Promise<void> {
    try {
      const investorStats = await this.investorStatsService.updateInvestorStats(
        Number(req.params.id),
        req.body,
      );
      if (investorStats) {
        this.webSocketServer.emit('investorStatsUpdated', investorStats);
        res.json(investorStats);
      } else {
        res.status(404).json({ message: 'Investor stats not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating investor stats', error });
    }
  }

  async deleteInvestorStats(req: Request, res: Response): Promise<void> {
    try {
      await this.investorStatsService.deleteInvestorStats(Number(req.params.id));
      this.webSocketServer.emit('investorStatsDeleted', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting investor stats', error });
    }
  }

  async getTotalInvestors(req: Request, res: Response): Promise<void> {
    try {
      const total = await this.investorStatsService.calculateTotalInvestors(Number(req.params.id));
      res.json({ totalInvestors: total });
    } catch (error) {
      res.status(500).json({ message: 'Error calculating total investors', error });
    }
  }

  async getQualifiedInvestorPercentage(req: Request, res: Response): Promise<void> {
    try {
      const percentage = await this.investorStatsService.calculateQualifiedInvestorPercentage(
        Number(req.params.id),
      );
      res.json({ qualifiedInvestorPercentage: percentage });
    } catch (error) {
      res.status(500).json({ message: 'Error calculating qualified investor percentage', error });
    }
  }
}
