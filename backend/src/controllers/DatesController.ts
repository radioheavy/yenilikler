import { Request, Response } from 'express';
import { DatesService } from '../services/DatesService';
import { AppDataSource } from '../data-source';  // AppDataSource import et
import { Dates } from '../entities/Dates';
import { WebSocketServer } from '../websocket/socketServer';

export class DatesController {
  private datesService: DatesService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const datesRepository = AppDataSource.getRepository(Dates);  // getRepository değiştir
    this.datesService = new DatesService(datesRepository);
    this.webSocketServer = webSocketServer;
  }

  async createDates(req: Request, res: Response): Promise<void> {
    try {
      const dates = await this.datesService.createDates(req.body);
      this.webSocketServer.emit('datesCreated', dates);
      res.status(201).json(dates);
    } catch (error) {
      res.status(500).json({ message: "Error creating dates", error });
    }
  }

  async getDates(req: Request, res: Response): Promise<void> {
    try {
      const dates = await this.datesService.getDates(Number(req.params.id));
      if (dates) {
        res.json(dates);
      } else {
        res.status(404).json({ message: "Dates not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error retrieving dates", error });
    }
  }

  async updateDates(req: Request, res: Response): Promise<void> {
    try {
      const dates = await this.datesService.updateDates(Number(req.params.id), req.body);
      if (dates) {
        this.webSocketServer.emit('datesUpdated', dates);
        res.json(dates);
      } else {
        res.status(404).json({ message: "Dates not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating dates", error });
    }
  }

  async deleteDates(req: Request, res: Response): Promise<void> {
    try {
      await this.datesService.deleteDates(Number(req.params.id));
      this.webSocketServer.emit('datesDeleted', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting dates", error });
    }
  }

  async getCampaignDuration(req: Request, res: Response): Promise<void> {
    try {
      const duration = await this.datesService.calculateCampaignDuration(Number(req.params.id));
      res.json({ duration });
    } catch (error) {
      res.status(500).json({ message: "Error calculating campaign duration", error });
    }
  }
}
