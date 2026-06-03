import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../auth/guards/platform-admin.guard';
import { TenantAdminGuard } from '../auth/guards/tenant-admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Vérifier que l'utilisateur accède à son propre tenant (sauf si c'est un PLATFORM_ADMIN)
    if (user.role !== 'PLATFORM_ADMIN') {
      const userTenantId = user.tenantId?.toString();
      if (!userTenantId || userTenantId !== id) {
        throw new UnauthorizedException('You can only access your own tenant');
      }
    }
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'PLATFORM_ADMIN' && user.tenantId !== id) {
      throw new UnauthorizedException('You can only update your own tenant');
    }
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Get(':id/modules')
  @UseGuards(JwtAuthGuard)
  getModuleFlags(@Param('id') id: string, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN' && user.tenantId !== id) {
      throw new UnauthorizedException('You can only access your own tenant');
    }
    return this.tenantsService.getModuleFlags(id);
  }

  @Patch(':id/modules')
  @UseGuards(JwtAuthGuard, TenantAdminGuard)
  updateModuleFlags(
    @Param('id') id: string,
    @Body() body: { moduleFlags: Record<string, boolean> },
    @CurrentUser() user: any,
  ) {
    if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
      throw new UnauthorizedException('You can only update your own tenant modules');
    }
    return this.tenantsService.updateModuleFlags(id, body.moduleFlags || {});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }

  @Get(':id/settings')
  getSettings(@Param('id') id: string) {
    return this.tenantsService.getSettings(id);
  }

  @Patch(':id/company-info')
  updateCompanyInfo(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateCompanyInfo(id, data);
  }

  @Patch(':id/bank-account')
  updateBankAccount(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateBankAccount(id, data);
  }

  @Patch(':id/invoice-settings')
  updateInvoiceSettings(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateInvoiceSettings(id, data);
  }

  @Patch(':id/notification-preferences')
  updateNotificationPreferences(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateNotificationPreferences(id, data);
  }

  @Patch(':id/security-settings')
  updateSecuritySettings(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateSecuritySettings(id, data);
  }

  @Patch(':id/billing-settings')
  updateBillingSettings(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateBillingSettings(id, data);
  }

  @Get(':id/billing-settings')
  getBillingSettings(@Param('id') id: string) {
    return this.tenantsService.getBillingSettings(id);
  }

  @Patch(':id/payment-methods')
  @UseGuards(JwtAuthGuard, TenantAdminGuard)
  updatePaymentMethods(
    @Param('id') id: string,
    @Body() paymentMethods: any,
    @CurrentUser() user: any,
  ) {
    // Vérifier que l'utilisateur modifie son propre tenant
    if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
      throw new Error('You can only update your own tenant payment methods');
    }
    return this.tenantsService.updatePaymentMethods(id, paymentMethods);
  }

  @Get(':id/payment-methods')
  @UseGuards(JwtAuthGuard, TenantAdminGuard)
  getPaymentMethods(@Param('id') id: string, @CurrentUser() user: any) {
    // Vérifier que l'utilisateur accède à son propre tenant
    if (user.tenantId !== id && user.role !== 'PLATFORM_ADMIN') {
      throw new Error('You can only access your own tenant payment methods');
    }
    return this.tenantsService.getPaymentMethods(id);
  }
}
