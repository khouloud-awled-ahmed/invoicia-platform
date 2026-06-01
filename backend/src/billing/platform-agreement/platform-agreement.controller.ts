import { Controller, Get, Post, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PlatformAgreementService } from './platform-agreement.service';

@Controller('billing/platform-agreement')
@UseGuards(JwtAuthGuard)
export class PlatformAgreementController {
  constructor(private readonly platformAgreementService: PlatformAgreementService) {}

  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    return this.platformAgreementService.getStatus(user.tenantId);
  }

  @Post('invoice/:id/transmit')
  async transmitInvoice(
    @Param('id') invoiceId: string,
    @Body() options: { format?: 'UBL' | 'CII' | 'Factur-X'; platform?: string },
    @CurrentUser() user: any,
  ) {
    const isEnabled = await this.platformAgreementService.isEnabled(user.tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Platform Agreement is not enabled for this tenant');
    }

    return this.platformAgreementService.transmitInvoice(
      invoiceId,
      user.tenantId,
      options.format || 'Factur-X',
      options.platform,
    );
  }

  @Get('invoice/:id/status')
  async getInvoiceTransmissionStatus(@Param('id') invoiceId: string, @CurrentUser() user: any) {
    return this.platformAgreementService.getTransmissionStatus(invoiceId, user.tenantId);
  }

  @Get('platforms')
  async getAvailablePlatforms(@CurrentUser() user: any) {
    return this.platformAgreementService.getAvailablePlatforms();
  }
}
