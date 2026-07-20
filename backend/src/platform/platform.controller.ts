import {
  Controller, Get, Post, Patch, Put, Delete,
  Body, Param, UseGuards, BadRequestException,
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
import { InvoiceEmailService } from './invoice-generator/invoice-email.service';

@Controller('platform')
@UseGuards(JwtAuthGuard)
export class PlatformController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly platformSettingsService: PlatformSettingsService,
    private readonly platformInvoicesService: PlatformInvoicesService,
    private readonly invoiceEmailService: InvoiceEmailService,
  ) {}

  @Get('notifications')
  async getNotifications(@CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.getNotifications();
  }

  @Get('tenants')
  async findAll(@CurrentUser() user: any) {
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
  async updateModules(@Param('id') id: string, @Body() updateModulesDto: UpdateTenantModulesDto, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenantModules(id, updateModulesDto.modules);
  }

  @Patch('tenants/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED' }, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenantStatus(id, body.subscriptionStatus);
  }

  @Patch('tenants/:id')
  async updateTenant(@Param('id') id: string, @Body() body: { name?: string; email?: string; adminEmail?: string; planId?: string; subscriptionStatus?: string }, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    return this.platformService.updateTenant(id, body);
  }

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
  async updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdateSubscriptionPlanDto, @CurrentUser() user: any) {
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

  @Post('tenants/:id/approve-transfer')
  async approveTransfer(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    const tenant = await this.platformService.updateTenantStatus(id, 'ACTIVE');
    const invoice = await this.platformInvoicesService.generateFinalInvoiceForTransfer(id);
    return {
      success: true,
      tenant,
      invoice: { id: invoice._id.toString(), invoiceNumber: invoice.invoiceNumber, pdfUrl: invoice.pdfUrl, status: invoice.status, emailSent: invoice.emailSent },
      message: 'Virement approuvé et facture générée',
    };
  }

  // ─── Client claims they paid ──────────────────────────────────────────────
  @Post('tenants/:id/claim-payment')
  async claimPayment(
    @Param('id') id: string,
    @Body() body: { amount: number; companyName: string; plan: string },
    @CurrentUser() user: any,
  ) {
    // Mark tenant as payment claimed
    await this.platformService.updateTenant(id, { subscriptionStatus: 'PENDING_PAYMENT' });

    // Send email alert to platform admin
    this.invoiceEmailService.sendAdminPaymentClaimedAlert(
      body.companyName,
      body.amount,
      body.plan,
      id,
    ).catch(() => {});

    return { success: true, message: 'Votre déclaration de paiement a été envoyée' };
  }
  // ─── AI Insights endpoint ──────────────────────────────────────────────────
  @Post('ai-insights')
  async getAiInsights(@Body() body: { prompt: string }, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') throw new BadRequestException('Acces refuse');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: body.prompt }] }),
    });
    const data = await response.json();
    const aiText = data?.content?.[0]?.text;
    if (aiText) return { text: aiText };
    const activeMatch = body.prompt.match(/Clients actifs \((\d+)\)/);
    const pendingMatch = body.prompt.match(/En attente de paiement \((\d+)\)/);
    const revenueMatch = body.prompt.match(/Revenu mensuel actuel: (\d+)/);
    const active = activeMatch ? activeMatch[1] : '0';
    const pending = pendingMatch ? pendingMatch[1] : '0';
    const revenue = revenueMatch ? revenueMatch[1] : '0';
    const msg = pending !== '0'
      ? `${pending} client(s) sont en attente de validation de paiement — action prioritaire pour augmenter le revenu.`
      : `Tous les clients sont à jour dans leurs paiements.`;
    return { text: `La plateforme compte ${active} clients actifs générant ${revenue} TND/mois. ${msg} Pour accélérer la croissance, proposez des offres modulaires adaptées aux besoins de chaque entreprise.` };
  }

  // ─── Activity Feed ────────────────────────────────────────────────────────
  @Get('activity-feed')
  async getActivityFeed(@CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') throw new BadRequestException('Accès refusé');
    const tenants = await this.platformService.findAllTenants();
    const activities: any[] = [];
    const now = new Date();

    tenants.forEach((tenant: any) => {
      const createdAt = tenant.createdAt ? new Date(tenant.createdAt) : null;
      const updatedAt = tenant.updatedAt ? new Date(tenant.updatedAt) : null;

      if (createdAt) {
        activities.push({
          id: `reg_${tenant.id}`,
          type: 'registration',
          icon: '🆕',
          color: '#6366f1',
          title: `${tenant.name} a rejoint la plateforme`,
          subtitle: `${(tenant.modules || []).length} modules sélectionnés`,
          time: createdAt,
          status: tenant.subscriptionStatus,
        });
      }

      if (tenant.subscriptionStatus === 'ACTIVE' && updatedAt && updatedAt > createdAt) {
        activities.push({
          id: `pay_${tenant.id}`,
          type: 'payment',
          icon: '✅',
          color: '#16a34a',
          title: `${tenant.name} — paiement approuvé`,
          subtitle: `Accès activé avec succès`,
          time: updatedAt,
          status: 'ACTIVE',
        });
      }

      if (tenant.subscriptionStatus === 'PENDING_PAYMENT') {
        activities.push({
          id: `pending_${tenant.id}`,
          type: 'pending',
          icon: '💳',
          color: '#d97706',
          title: `${tenant.name} — virement déclaré`,
          subtitle: `En attente de validation`,
          time: updatedAt || createdAt,
          status: 'PENDING_PAYMENT',
        });
      }

      if (tenant.subscriptionStatus === 'SUSPENDED') {
        activities.push({
          id: `susp_${tenant.id}`,
          type: 'suspended',
          icon: '🚫',
          color: '#dc2626',
          title: `${tenant.name} — compte suspendu`,
          subtitle: `Accès révoqué`,
          time: updatedAt || createdAt,
          status: 'SUSPENDED',
        });
      }
    });

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    return activities.slice(0, 15).map(a => ({
      ...a,
      timeAgo: (() => {
        const diff = now.getTime() - new Date(a.time).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return "À l'instant";
        if (mins < 60) return `Il y a ${mins} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days === 1) return 'Hier';
        return `Il y a ${days} jours`;
      })(),
    }));
  }
}
