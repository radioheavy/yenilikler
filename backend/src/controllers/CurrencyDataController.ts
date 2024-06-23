import { Request, Response } from 'express';
import { CurrencyDataService } from '../services/CurrencyDataService';
import { AppDataSource } from '../data-source';  // AppDataSource import et
import { CurrencyData } from '../entities/CurrencyData';
import { ShareDetails } from '../entities/ShareDetails';
import { WebSocketServer } from '../websocket/socketServer';

export class CurrencyDataController {
  private currencyDataService: CurrencyDataService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const currencyDataRepository = AppDataSource.getRepository(CurrencyData);  // getRepository değiştir
    const shareDetailsRepository = AppDataSource.getRepository(ShareDetails);  // getRepository değiştir
    this.currencyDataService = new CurrencyDataService(currencyDataRepository, shareDetailsRepository);
    this.webSocketServer = webSocketServer;
  }

  async createCurrencyData(req: Request, res: Response): Promise<void> {
    try {
      const currencyData = await this.currencyDataService.createCurrencyData(req.body);
      this.webSocketServer.emit('currencyDataCreated', currencyData);
      res.status(201).json(currencyData);
    } catch (error) {
      res.status(500).json({ message: "Error creating currency data", error });
    }
  }

  async getCurrencyData(req: Request, res: Response): Promise<void> {
    try {
      const currencyData = await this.currencyDataService.getCurrencyData(Number(req.params.id));
      if (currencyData) {
        res.json(currencyData);
      } else {
        res.status(404).json({ message: "Currency data not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error retrieving currency data", error });
    }
  }

  async updateCurrencyData(req: Request, res: Response): Promise<void> {
    try {
      const currencyData = await this.currencyDataService.updateCurrencyData(Number(req.params.id), req.body);
      if (currencyData) {
        this.webSocketServer.emit('currencyDataUpdated', currencyData);
        res.json(currencyData);
      } else {
        res.status(404).json({ message: "Currency data not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating currency data", error });
    }
  }

  async deleteCurrencyData(req: Request, res: Response): Promise<void> {
    try {
      await this.currencyDataService.deleteCurrencyData(Number(req.params.id));
      this.webSocketServer.emit('currencyDataDeleted', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting currency data", error });
    }
  }

  async getInflationAdjustedValues(req: Request, res: Response): Promise<void> {
    try {
      const values = await this.currencyDataService.calculateInflationAdjustedValues(Number(req.params.id));
      res.json(values);
    } catch (error) {
      res.status(500).json({ message: "Error calculating inflation adjusted values", error });
    }
  }

  async getCurrencyChangeRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = await this.currencyDataService.calculateCurrencyChangeRates(Number(req.params.id));
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Error calculating currency change rates", error });
    }
  }
}
