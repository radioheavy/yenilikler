import { Request, Response } from "express";
import { CampaignService } from "../services/CampaignService";
import { AppDataSource } from "../data-source"; // AppDataSource import et
import { Campaign } from "../entities/Campaign";
import { WebSocketServer } from "../websocket/socketServer";

export class CampaignController {
  private campaignService: CampaignService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const campaignRepository = AppDataSource.getRepository(Campaign); // getRepository değiştir
    this.campaignService = new CampaignService(campaignRepository);
    this.webSocketServer = webSocketServer;
  }

  async createCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaign = await this.campaignService.createCampaign(req.body);
      this.webSocketServer.emit("campaignCreated", campaign);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Error creating campaign", error });
    }
  }

  async getCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaign = await this.campaignService.getCampaign(
        Number(req.params.id),
      );
      if (campaign) {
        res.json(campaign);
      } else {
        res.status(404).json({ message: "Campaign not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error retrieving campaign", error });
    }
  }

  async updateCampaign(req: Request, res: Response): Promise<void> {
    try {
      const campaign = await this.campaignService.updateCampaign(
        Number(req.params.id),
        req.body,
      );
      if (campaign) {
        this.webSocketServer.emit("campaignUpdated", campaign);
        res.json(campaign);
      } else {
        res.status(404).json({ message: "Campaign not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating campaign", error });
    }
  }

  async deleteCampaign(req: Request, res: Response): Promise<void> {
    try {
      await this.campaignService.deleteCampaign(Number(req.params.id));
      this.webSocketServer.emit("campaignDeleted", Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting campaign", error });
    }
  }

  async getAllCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const campaigns = await this.campaignService.getAllCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving campaigns", error });
    }
  }
}
