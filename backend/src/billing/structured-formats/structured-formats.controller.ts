import { Controller, Get, Post, Param, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { StructuredFormatsService } from './structured-formats.service';

@Controller('billing/structured-formats')
@UseGuards(JwtAuthGuard)
export class StructuredFormatsController {
  constructor(private readonly structuredFormatsService: StructuredFormatsService) {}

  @Get('invoice/:id/:format')
  async generateInvoice(
    @Param('id') invoiceId: string,
    @Param('format') format: 'UBL' | 'CII' | 'Factur-X',
    @CurrentUser() user: any,
  ) {
    const isEnabled = await this.structuredFormatsService.isEnabled(user.tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Structured formats are not enabled for this tenant');
    }

    return this.structuredFormatsService.generateInvoice(invoiceId, format, user.tenantId);
  }

  @Post('invoice/:id/validate')
  async validateInvoice(@Param('id') invoiceId: string, @CurrentUser() user: any) {
    const isEnabled = await this.structuredFormatsService.isEnabled(user.tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Structured formats are not enabled for this tenant');
    }

    return this.structuredFormatsService.validateInvoice(invoiceId, user.tenantId);
  }
}
