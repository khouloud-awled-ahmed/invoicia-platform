import { Controller, Get, Param, UseGuards, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PlatformInvoicesService } from './platform-invoices.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import * as fs from 'fs';
import * as path from 'path';

@Controller('platform/invoices')
export class PlatformInvoicesController {
  constructor(private readonly invoicesService: PlatformInvoicesService) {}

  /**
   * Récupère toutes les factures d'un tenant (pour l'espace client)
   */
  @Get('my-invoices')
  @UseGuards(JwtAuthGuard)
  async getMyInvoices(@CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new Error('Tenant ID requis');
    }
    return this.invoicesService.findByTenant(user.tenantId);
  }

  /**
   * Récupère une facture spécifique
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    const tenantId = user.role === 'PLATFORM_ADMIN' ? undefined : user.tenantId;
    return this.invoicesService.findOne(id, tenantId);
  }

  /**
   * Télécharge le PDF d'une facture
   */
  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadInvoice(@Param('id') id: string, @Res() res: Response, @CurrentUser() user: any) {
    const tenantId = user.role === 'PLATFORM_ADMIN' ? undefined : user.tenantId;
    const invoice = await this.invoicesService.findOne(id, tenantId);

    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      throw new Error('PDF not found');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    
    const fileStream = fs.createReadStream(invoice.pdfPath);
    fileStream.pipe(res);
  }

  /**
   * Récupère toutes les factures (Super Admin uniquement)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllInvoices(@Query('tenantId') tenantId: string | undefined, @CurrentUser() user: any) {
    if (user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs de la plateforme');
    }
    if (tenantId) {
      return this.invoicesService.findByTenant(tenantId);
    }
    // TODO: Implémenter getAll() pour récupérer toutes les factures
    return [];
  }
}
