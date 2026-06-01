import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AutomationService } from './automation.service';

@Controller('billing/automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('invoiceable-entries')
  getInvoiceableEntries(@Query() filters: any, @CurrentUser() user: any) {
    return this.automationService.getInvoiceableEntries(user.tenantId, filters);
  }

  @Post('generate-invoices')
  generateInvoices(@Body() options: any, @CurrentUser() user: any) {
    return this.automationService.generateInvoices(user.tenantId, options);
  }

  @Post('generate-from-cra')
  generateFromCRA(@Body() options: any, @CurrentUser() user: any) {
    return this.automationService.generateFromCRA(user.tenantId, options);
  }
}
