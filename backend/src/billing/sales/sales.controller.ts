import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ModuleAccessGuard } from '../guards/module-access.guard';
import { SalesService } from './sales.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { UniversalDocumentParserService } from '../../document-parser/services/universal-document-parser.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { Client, ClientDocument } from '../../clients/schemas/client.schema';

@Controller('billing/sales')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly documentParser: UniversalDocumentParserService,
    private readonly invoicePdfService: InvoicePdfService,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  @Post('invoices')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @CurrentUser() user: any) {
    if (!user?.tenantId) {
      throw new BadRequestException('Tenant ID is missing from user context');
    }
    return this.salesService.createInvoice(createInvoiceDto, user.tenantId);
  }

  @Get('invoices')
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.salesService.findAllInvoices(user.tenantId, filters);
  }

  @Get('invoices/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.findOneInvoice(id, user.tenantId);
  }

  @Get('invoices/:id/download')
  async downloadPdf(@Param('id') id: string, @CurrentUser() user: any, @Res() res: Response) {
    const invoice = await this.salesService.findOneInvoice(id, user.tenantId);
    if (!invoice) throw new NotFoundException('Facture introuvable');
    const tenant = await this.tenantModel.findById(user.tenantId).exec();
    if (!tenant) throw new NotFoundException('Société introuvable');
    const client = invoice.clientId
      ? await this.clientModel.findById(invoice.clientId).exec()
      : null;
    const pdf = await this.invoicePdfService.generateSalesInvoicePdf(
      invoice as any,
      tenant,
      client,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Facture-${invoice.number}.pdf"`);
    res.send(pdf);
  }

  @Patch('invoices/:id')
  update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.salesService.updateInvoice(id, updateInvoiceDto, user.tenantId);
  }

  @Delete('invoices/:id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.removeInvoice(id, user.tenantId);
  }
  @Patch('invoices/:id/validate')
  validateInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.changeInvoiceStatus(id, 'validated', user.tenantId);
  }

  @Patch('invoices/:id/pay')
  markAsPaid(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.changeInvoiceStatus(id, 'paid', user.tenantId);
  }

  @Patch('invoices/:id/cancel')
  cancelInvoice(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.salesService.cancelInvoice(id, body.reason, user.tenantId);
  }

  @Patch('invoices/:id/archive')
  archiveInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    return this.salesService.changeInvoiceStatus(id, 'archived', user.tenantId);
  }

  @Get('invoices/next-number')
  getNextNumber(@CurrentUser() user: any) {
    return this.salesService.getNextInvoiceNumber(user.tenantId);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.salesService.getDashboard(user.tenantId);
  }
  /**
   * Analyse une facture fournisseur avec OCR
   */
  @Post('invoices/parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseInvoice(@UploadedFile() file: any, @CurrentUser() user: any) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return await this.documentParser.analyze(file, 'INVOICE', user.tenantId);
  }
}
