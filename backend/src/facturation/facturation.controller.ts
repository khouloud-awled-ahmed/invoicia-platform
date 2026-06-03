import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('facturation')
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  @Get('pending')
  @UseGuards(JwtAuthGuard)
  getPendingLines(@CurrentUser() user: any) {
    return this.facturationService.getPendingLines(user.tenantId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@CurrentUser() user: any) {
    return this.facturationService.getStats(user.tenantId);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  generateInvoices(@Body() dto: GenerateInvoicesDto, @CurrentUser() user: any) {
    return this.facturationService.generateInvoices(dto.craLineIds, user.tenantId);
  }
}
