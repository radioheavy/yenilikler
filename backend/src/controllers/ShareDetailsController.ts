import { Request, Response } from 'express';
import { ShareDetailsService } from '../services/ShareDetailsService';
import { AppDataSource } from '../data-source'; // AppDataSource import et
import { ShareDetails } from '../entities/ShareDetails';
import { FinancialDetails } from '../entities/FinancialDetails';
import { WebSocketServer } from '../websocket/socketServer';

export class ShareDetailsController {
  private shareDetailsService: ShareDetailsService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const shareDetailsRepository = AppDataSource.getRepository(ShareDetails); // getRepository değiştir
    const financialDetailsRepository = AppDataSource.getRepository(FinancialDetails); // getRepository değiştir
    this.shareDetailsService = new ShareDetailsService(
      shareDetailsRepository,
      financialDetailsRepository,
    );
    this.webSocketServer = webSocketServer;
  }

  async createShareDetails(req: Request, res: Response): Promise<void> {
    try {
      const shareDetails = await this.shareDetailsService.createShareDetails(req.body);
      this.webSocketServer.emit('shareDetailsCreated', shareDetails);
      res.status(201).json(shareDetails);
    } catch (error) {
      res.status(500).json({ message: 'Error creating share details', error });
    }
  }

  async getShareDetails(req: Request, res: Response): Promise<void> {
    try {
      const shareDetails = await this.shareDetailsService.getShareDetails(Number(req.params.id));
      if (shareDetails) {
        res.json(shareDetails);
      } else {
        res.status(404).json({ message: 'Share details not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving share details', error });
    }
  }

  async updateShareDetails(req: Request, res: Response): Promise<void> {
    try {
      const shareDetails = await this.shareDetailsService.updateShareDetails(
        Number(req.params.id),
        req.body,
      );
      if (shareDetails) {
        this.webSocketServer.emit('shareDetailsUpdated', shareDetails);
        res.json(shareDetails);
      } else {
        res.status(404).json({ message: 'Share details not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating share details', error });
    }
  }

  async deleteShareDetails(req: Request, res: Response): Promise<void> {
    try {
      await this.shareDetailsService.deleteShareDetails(Number(req.params.id));
      this.webSocketServer.emit('shareDetailsDeleted', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting share details', error });
    }
  }

  async getSharePriceChange(req: Request, res: Response): Promise<void> {
    try {
      const changes = await this.shareDetailsService.calculateSharePriceChange(
        Number(req.params.id),
      );
      res.json(changes);
    } catch (error) {
      res.status(500).json({ message: 'Error calculating share price change', error });
    }
  }

  async updateCapitalAfterFunding(req: Request, res: Response): Promise<void> {
    try {
      const updatedShareDetails = await this.shareDetailsService.updateCapitalAfterFunding(
        Number(req.params.id),
      );
      this.webSocketServer.emit('shareDetailsCapitalUpdated', updatedShareDetails);
      res.json(updatedShareDetails);
    } catch (error) {
      res.status(500).json({ message: 'Error updating capital after funding', error });
    }
  }
}
