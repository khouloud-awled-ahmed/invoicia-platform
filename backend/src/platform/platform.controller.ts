import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PlatformService } from './platform.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { PlatformSettingsService } from './platform-settings.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantModulesDto } from './dto/update-tenant-modules.dto';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { PlatformInvoicesService } from './platform-invoices/platform-invoices.service';

@Controller('platform')
@UseGuards(JwtAuthGuard)
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly platformInvoicesService: PlatformInvoicesService,
  ) {}

  @Get('tenants')
  async findAll(@CurrentUser() user: any) {
    // Vérifier que l'utilisateur est PLATFORM_ADMIN
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.findAllTenants();
  }

  @Get('tenants/:id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.findOneTenant(id);
  }

  @Post('tenants')
  async create(@Body() createTenantDto: CreateTenantDto, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.createTenant(createTenantDto);
  }

  @Patch('tenants/:id/modules')
  async updateModules(
    @Param('id') id: string,
    @Body() updateModulesDto: UpdateTenantModulesDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenantModules(id, updateModulesDto.modules);
  }

  @Patch('tenants/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED' },
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenantStatus(id, body.subscriptionStatus);
  }

  @Patch('tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @Body() body: { name?: string; email?: string; adminEmail?: string; planId?: string; subscriptionStatus?: string },
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenant(id, body);
  }

  // ==========================================
  // 📦 SUBSCRIPTION PLANS
  // ==========================================

  @Get('plans')
  async getPlans(@CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.subscriptionPlansService.findAll();
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.subscriptionPlansService.findOne(id);
  }

  @Post('plans')
  async createPlan(@Body() createPlanDto: CreateSubscriptionPlanDto, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.subscriptionPlansService.create(createPlanDto);
  }

  @Patch('plans/:id')
  async updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdateSubscriptionPlanDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.subscriptionPlansService.update(id, updatePlanDto);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.subscriptionPlansService.remove(id);
  }

  // ==========================================
  // ⚙️ PLATFORM SETTINGS
  // ==========================================

  @Get('settings')
  async getSettings(@CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformSettingsService.getSettings();
  }

  @Put('settings')
  async updateSettings(@Body() updateDto: UpdatePlatformSettingsDto, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformSettingsService.updateSettings(updateDto);
  }

  // ==========================================
  // 💰 APPROBATION DE VIREMENT
  // ==========================================

  @Post('tenants/:id/approve-transfer')
  async approveTransfer(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }

    // Activer l'abonnement
    const tenant = await this.platformService.updateTenantStatus(id, 'ACTIVE');
    
    // Générer la facture finale (le service gère déjà l'envoi de l'email)
    const invoice = await this.platformInvoicesService.generateFinalInvoiceForTransfer(id);

    return {
      success: true,
      tenant,
      invoice: {
        id: invoice._id.toString(),
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: invoice.pdfUrl,
        status: invoice.status,
        emailSent: invoice.emailSent,
      },
      message: 'Virement approuvé et facture générée',
    };
  }
}
