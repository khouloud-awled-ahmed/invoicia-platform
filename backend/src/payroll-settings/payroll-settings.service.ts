import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { SocialOrg, SocialOrgDocument } from './schemas/social-org.schema';
import { UpdatePayrollSettingsDto } from './dto/update-payroll-settings.dto';
import { CreateSocialOrgDto } from './dto/create-social-org.dto';

@Injectable()
export class PayrollSettingsService {
  private readonly logger = new Logger(PayrollSettingsService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(SocialOrg.name) private socialOrgModel: Model<SocialOrgDocument>,
  ) {}

  async getSettings(tenantId: string) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    return tenant.payrollSettings || {};
  }

  async updateSettings(tenantId: string, updateDto: UpdatePayrollSettingsDto) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    tenant.payrollSettings = {
      ...tenant.payrollSettings,
      ...updateDto,
    };

    await tenant.save();
    return tenant.payrollSettings;
  }

  async createSocialOrg(tenantId: string, createDto: CreateSocialOrgDto): Promise<SocialOrg> {
    const socialOrg = new this.socialOrgModel({
      ...createDto,
      tenantId,
    });
    return socialOrg.save();
  }

  async findAllSocialOrgs(tenantId: string): Promise<SocialOrg[]> {
    return this.socialOrgModel.find({ tenantId }).exec();
  }

  async findOneSocialOrg(id: string, tenantId: string): Promise<SocialOrg> {
    const socialOrg = await this.socialOrgModel.findOne({ _id: id, tenantId }).exec();
    if (!socialOrg) {
      throw new NotFoundException(`SocialOrg with ID ${id} not found`);
    }
    return socialOrg;
  }

  async deleteSocialOrg(id: string, tenantId: string): Promise<void> {
    const result = await this.socialOrgModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`SocialOrg with ID ${id} not found`);
    }
  }
}
