import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import * as bcrypt from 'bcrypt';
import { InvoiceEmailService } from './invoice-generator/invoice-email.service';

@Injectable()
export class PlatformService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly invoiceEmailService: InvoiceEmailService,
  ) {}

  async findAllTenants() {
    const tenants = await this.tenantModel.find().lean().exec();
    return tenants.map((tenant) => ({
      id: (tenant as any)._id?.toString(),
      name: tenant.name,
      businessName: tenant.businessName,
      email: tenant.email,
      adminEmail: tenant.adminEmail,
      modules: tenant.modules || [],
      subscriptionStatus: tenant.subscriptionStatus || 'PENDING_PAYMENT',
      planType: tenant.planType || 'CUSTOM',
      status: tenant.status,
      currentUsers: tenant.currentUsers,
      maxUsers: tenant.maxUsers,
      createdAt: (tenant as any).createdAt,
      updatedAt: (tenant as any).updatedAt,
    }));
  }

  async findOneTenant(id: string) {
    const tenant = await this.tenantModel.findById(id).lean().exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return {
      id: (tenant as any)._id?.toString(),
      ...tenant,
    };
  }

  async createTenant(createTenantDto: CreateTenantDto) {
    const existingUser = await this.userModel
      .findOne({ email: createTenantDto.adminEmail.toLowerCase() })
      .exec();
    if (existingUser) {
      throw new BadRequestException(
        `Un utilisateur avec l'email ${createTenantDto.adminEmail} existe déjà`,
      );
    }

    const existingTenant = await this.tenantModel
      .findOne({ matriculeFiscal: createTenantDto.matriculeFiscal })
      .exec();
    if (existingTenant) {
      throw new BadRequestException(
        `Un tenant avec le Matricule Fiscal ${createTenantDto.matriculeFiscal} existe déjà`,
      );
    }

    const tenant = new this.tenantModel({
      name: createTenantDto.name,
      businessName: createTenantDto.businessName || createTenantDto.name,
      matriculeFiscal: createTenantDto.matriculeFiscal,
      email: createTenantDto.adminEmail.toLowerCase(),
      adminEmail: createTenantDto.adminEmail.toLowerCase(),
      modules: createTenantDto.modules || [],
      subscriptionStatus: createTenantDto.subscriptionStatus || 'PENDING_PAYMENT',
      planType: createTenantDto.planType || 'CUSTOM',
      planId: createTenantDto.planId,
      status: 'pending',
      currentUsers: 0,
      maxUsers: createTenantDto.maxUsers || 10,
      subscriptionPlan: 'essential',
      pack: 'essential',
      settings: { paymentMethods: [] },
    });

    const savedTenant = await tenant.save();

    const hashedPassword = await bcrypt.hash(
      createTenantDto.adminPassword || 'TempPassword123!',
      10,
    );
    const adminUser = new this.userModel({
      name: createTenantDto.adminName || 'Administrateur',
      email: createTenantDto.adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'TENANT_ADMIN',
      tenantId: savedTenant._id.toString(),
      isActive: true,
    });

    await adminUser.save();

    await this.tenantModel
      .updateOne({ _id: savedTenant._id }, { $inc: { currentUsers: 1 } })
      .exec();

    // ─── Send email alert to platform admin ───────────────────────────────
    this.invoiceEmailService.sendAdminNewTenantAlert(
      savedTenant.name,
      savedTenant.adminEmail,
      savedTenant.planType || 'Standard',
    ).catch(() => {});

    return {
      id: savedTenant._id.toString(),
      name: savedTenant.name,
      businessName: savedTenant.businessName,
      email: savedTenant.email,
      adminEmail: savedTenant.adminEmail,
      modules: savedTenant.modules,
      subscriptionStatus: savedTenant.subscriptionStatus,
      planType: savedTenant.planType,
      adminUser: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        name: adminUser.name,
      },
    };
  }

  async updateTenantModules(id: string, modules: string[]) {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    tenant.modules = modules;
    await tenant.save();
    return { id: tenant._id.toString(), modules: tenant.modules };
  }

  async updateTenantStatus(id: string, subscriptionStatus: string) {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    tenant.subscriptionStatus = subscriptionStatus;
    if (subscriptionStatus === 'ACTIVE') tenant.status = 'active';
    else if (subscriptionStatus === 'SUSPENDED') tenant.status = 'suspended';
    await tenant.save();
    return { id: tenant._id.toString(), subscriptionStatus: tenant.subscriptionStatus, status: tenant.status };
  }

  async updateTenant(id: string, updateData: { name?: string; email?: string; adminEmail?: string; planId?: string; subscriptionStatus?: string }) {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) throw new NotFoundException(`Tenant with ID ${id} not found`);
    if (updateData.name) tenant.name = updateData.name;
    if (updateData.email) tenant.email = updateData.email;
    if (updateData.adminEmail) tenant.adminEmail = updateData.adminEmail;
    if (updateData.planId !== undefined) tenant.planId = updateData.planId;
    if (updateData.subscriptionStatus) {
      tenant.subscriptionStatus = updateData.subscriptionStatus;
      if (updateData.subscriptionStatus === 'ACTIVE') tenant.status = 'active';
      else if (updateData.subscriptionStatus === 'SUSPENDED') tenant.status = 'suspended';
    }
    await tenant.save();
    return { id: tenant._id.toString(), name: tenant.name, email: tenant.email, adminEmail: tenant.adminEmail, planId: tenant.planId, subscriptionStatus: tenant.subscriptionStatus, status: tenant.status };
  }

  async getNotifications() {
    const tenants = await this.tenantModel.find().lean().exec();
    const notifications: any[] = [];
    const now = new Date();

    tenants.forEach((tenant: any) => {
      const createdAt = tenant.createdAt ? new Date(tenant.createdAt) : null;
      const diffMs = createdAt ? now.getTime() - createdAt.getTime() : null;
      const diffDays = diffMs !== null ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : null;
      const diffHours = diffMs !== null ? Math.floor(diffMs / (1000 * 60 * 60)) : null;

      if (diffDays !== null && diffDays <= 7) {
        const timeAgo = diffHours! < 1 ? "Il y a moins d'1h"
          : diffHours! < 24 ? `Il y a ${diffHours}h`
          : diffDays === 1 ? 'Hier'
          : `Il y a ${diffDays} jours`;

        notifications.push({
          id: `new_${tenant._id}`,
          type: 'new_client',
          title: 'Nouveau client inscrit',
          desc: `${tenant.name} a rejoint la plateforme`,
          time: timeAgo,
          read: false,
          createdAt: tenant.createdAt,
        });
      }

      if (tenant.subscriptionStatus === 'PENDING_PAYMENT') {
        notifications.push({
          id: `pending_${tenant._id}`,
          type: 'warning',
          title: 'Paiement en attente',
          desc: `${tenant.name} a un paiement en attente`,
          time: 'En attente',
          read: false,
          createdAt: tenant.updatedAt || tenant.createdAt,
        });
      }

      if (tenant.subscriptionStatus === 'SUSPENDED') {
        notifications.push({
          id: `suspended_${tenant._id}`,
          type: 'suspended',
          title: 'Compte suspendu',
          desc: `${tenant.name} a été suspendu`,
          time: 'Suspendu',
          read: false,
          createdAt: tenant.updatedAt || tenant.createdAt,
        });
      }
    });

    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return notifications.slice(0, 10);
  }
}