import { Body, Controller, Get, Post } from '@nestjs/common';
import { FacturationService } from './facturation.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@Controller('facturation')
export class FacturationController {
  constructor(private readonly facturationService: FacturationService) {}

  @Get('pending')
  getPendingLines() { return this.facturationService.getPendingLines(); }

  @Get('stats')
  getStats() { return this.facturationService.getStats(); }

  @Post('generate')
  generateInvoices(@Body() dto: GenerateInvoicesDto) {
    return this.facturationService.generateInvoices(dto.craLineIds);
  }
}