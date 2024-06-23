import { Request, Response } from 'express';
import { CompanyService } from '../services/CompanyService';
import { AppDataSource } from '../data-source';  // AppDataSource import et
import { Company } from '../entities/Company';
import { WebSocketServer } from '../websocket/socketServer';

export class CompanyController {
  private companyService: CompanyService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    const companyRepository = AppDataSource.getRepository(Company);  // getRepository değiştir
    this.companyService = new CompanyService(companyRepository);
    this.webSocketServer = webSocketServer;
  }

  async createCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = await this.companyService.createCompany(req.body);
      this.webSocketServer.emit('companyCreated', company);
      res.status(201).json(company);
    } catch (error) {
      res.status(500).json({ message: "Error creating company", error });
    }
  }

  async getCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = await this.companyService.getCompany(Number(req.params.id));
      if (company) {
        res.json(company);
      } else {
        res.status(404).json({ message: "Company not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error retrieving company", error });
    }
  }

  async updateCompany(req: Request, res: Response): Promise<void> {
    try {
      const company = await this.companyService.updateCompany(Number(req.params.id), req.body);
      if (company) {
        this.webSocketServer.emit('companyUpdated', company);
        res.json(company);
      } else {
        res.status(404).json({ message: "Company not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error updating company", error });
    }
  }

  async deleteCompany(req: Request, res: Response): Promise<void> {
    try {
      await this.companyService.deleteCompany(Number(req.params.id));
      this.webSocketServer.emit('companyDeleted', Number(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting company", error });
    }
  }

  async getAllCompanies(req: Request, res: Response): Promise<void> {
    try {
      const companies = await this.companyService.getAllCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving companies", error });
    }
  }

  async getCompanySocialMediaLinks(req: Request, res: Response): Promise<void> {
    try {
      const links = await this.companyService.getCompanySocialMediaLinks(Number(req.params.id));
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving company social media links", error });
    }
  }
}
