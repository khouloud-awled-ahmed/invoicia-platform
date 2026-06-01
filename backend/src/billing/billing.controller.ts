import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BillingService } from './billing.service';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('status')
  async getBillingStatus(@CurrentUser() user: any) {
    return this.billingService.getBillingStatus(user.tenantId);
  }

  @Get('summary')
  async getSummary(@CurrentUser() user: any, @Query() filters: any) {
    return this.billingService.getSummary(user.tenantId, filters);
  }
}
