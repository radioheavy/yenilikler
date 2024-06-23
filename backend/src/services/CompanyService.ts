// src/services/CompanyService.ts

import { Repository } from "typeorm";
import { Company } from "../entities/Company";

export class CompanyService {
  private companyRepository: Repository<Company>;

  constructor(companyRepository: Repository<Company>) {
    this.companyRepository = companyRepository;
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(data);
    await this.companyRepository.save(company);
    return company;
  }

  async getCompany(id: number): Promise<Company | null> {
    return this.companyRepository.findOne({
      where: { id },
      relations: ['campaign']
    });
  }

  async updateCompany(id: number, data: Partial<Company>): Promise<Company | null> {
    await this.companyRepository.update(id, data);
    return this.getCompany(id);
  }

  async deleteCompany(id: number): Promise<void> {
    await this.companyRepository.delete(id);
  }

  async getAllCompanies(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['campaign'] });
  }

  async getCompanySocialMediaLinks(id: number): Promise<Partial<Company>> {
    const company = await this.getCompany(id);
    if (!company) {
      throw new Error("Company not found");
    }
    return {
      facebookLink: company.facebookLink,
      instagramLink: company.instagramLink,
      linkedinLink: company.linkedinLink,
      twitterLink: company.twitterLink,
      fundingPageLink: company.fundingPageLink,
      websiteLink: company.websiteLink
    };
  }
}