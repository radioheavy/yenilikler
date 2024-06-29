import { Request, Response } from "express";
import { FinancialDetailsService } from "../services/FinancialDetailsService";
import { AppDataSource } from "../data-source"; // AppDataSource import et
import { FinancialDetails } from "../entities/FinancialDetails";
import { InvestorStats } from "../entities/InvestorStats";
import { CurrencyData } from "../entities/CurrencyData";
import { Campaign } from "../entities/Campaign";
import { WebSocketServer } from "../websocket/socketServer";

export class FinancialDetailsController {
  private financialDetailsService: FinancialDetailsService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const financialDetailsRepository =
      AppDataSource.getRepository(FinancialDetails); // getRepository değiştir
    const investorStatsRepository = AppDataSource.getRepository(InvestorStats); // getRepository değiştir
    const currencyDataRepository = AppDataSource.getRepository(CurrencyData); // getRepository değiştir
    const campaignRepository = AppDataSource.getRepository(Campaign); // getRepository değiştir
    this.financialDetailsService = new FinancialDetailsService(
      financialDetailsRepository,
      investorStatsRepository,
      currencyDataRepository,
      campaignRepository,
    );
    this.webSocketServer = webSocketServer;
  }

  async createFinancialDetails(req: Request, res: Response): Promise<void> {
    try {
      const financialDetails =
        await this.financialDetailsService.createFinancialDetails(req.body);
      this.webSocketServer.emit("financialDetailsCreated", financialDetails);
      res.status(201).json(financialDetails);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating financial details", error });
    }
  }

  async getFinancialDetails(req: Request, res: Response): Promise<void> {
    try {
      const financialDetails =
        await this.financialDetailsService.getFinancialDetails(
          Number(req.params.id),
        );
      if (financialDetails) {
        res.json(financialDetails);
      } else {
        res.status(404).json({ message: "Financial details not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error retrieving financial details", error });
    }
  }

  async updateFinancialDetails(req: Request, res: Response): Promise<void> {
    try {
      const financialDetails =
        await this.financialDetailsService.updateFinancialDetails(
          Number(req.params.id),
          req.body,
        );
      if (financialDetails) {
        this.webSocketServer.emit("financialDetailsUpdated", financialDetails);
        res.json(financialDetails);
      } else {
        res.status(404).json({ message: "Financial details not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating financial details", error });
    }
  }

  async deleteFinancialDetails(req: Request, res: Response): Promise<void> {
    try {
      await this.financialDetailsService.deleteFinancialDetails(
        Number(req.params.id),
      );
      this.webSocketServer.emit(
        "financialDetailsDeleted",
        Number(req.params.id),
      );
      res.status(204).send();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting financial details", error });
    }
  }

  async getRealizationRate(req: Request, res: Response): Promise<void> {
    try {
      const rate = await this.financialDetailsService.calculateRealizationRate(
        Number(req.params.id),
      );
      res.json({ realizationRate: rate });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error calculating realization rate", error });
    }
  }

  async getAverageInvestmentAmount(req: Request, res: Response): Promise<void> {
    try {
      const amount =
        await this.financialDetailsService.calculateAverageInvestmentAmount(
          Number(req.params.id),
        );
      res.json({ averageInvestmentAmount: amount });
    } catch (error) {
      res.status(500).json({
        message: "Error calculating average investment amount",
        error,
      });
    }
  }

  async getExtraFundingAmount(req: Request, res: Response): Promise<void> {
    try {
      const amount =
        await this.financialDetailsService.calculateExtraFundingAmount(
          Number(req.params.id),
        );
      res.json({ extraFundingAmount: amount });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error calculating extra funding amount", error });
    }
  }

  async getRemainingFundingAmount(req: Request, res: Response): Promise<void> {
    try {
      const amount =
        await this.financialDetailsService.calculateRemainingFundingAmount(
          Number(req.params.id),
        );
      res.json({ remainingFundingAmount: amount });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error calculating remaining funding amount", error });
    }
  }

  async getValuation(req: Request, res: Response): Promise<void> {
    try {
      const valuation = await this.financialDetailsService.calculateValuation(
        Number(req.params.id),
      );
      res.json(valuation);
    } catch (error) {
      res.status(500).json({ message: "Error calculating valuation", error });
    }
  }
}
