import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SubscribeDto } from './dto/subscribe.dto';

@Controller('billing/subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto, @CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new Error('Tenant ID requis');
    }
    return this.subscriptionService.subscribe(user.tenantId, subscribeDto);
  }

  @Get('validate-promo/:code/:planId')
  async validatePromoCode(@Param('code') code: string, @Param('planId') planId: string) {
    return this.subscriptionService.validatePromoCode(code, planId);
  }
}
