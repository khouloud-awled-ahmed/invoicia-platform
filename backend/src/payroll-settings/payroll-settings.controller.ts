import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PayrollSettingsService } from './payroll-settings.service';
import { DSNGeneratorService } from './dsn-generator.service';
import { UpdatePayrollSettingsDto } from './dto/update-payroll-settings.dto';
import { CreateSocialOrgDto } from './dto/create-social-org.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('payroll-settings')
@UseGuards(JwtAuthGuard)
export class PayrollSettingsController {
  constructor(
    private readonly payrollSettingsService: PayrollSettingsService,
    private readonly dsnGeneratorService: DSNGeneratorService,
  ) {}

  @Get('settings')
  async getSettings(@CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.payrollSettingsService.getSettings(user.tenantId);
  }

  @Patch('settings')
  async updateSettings(
    @CurrentUser() user: any,
    @Body() updateDto: UpdatePayrollSettingsDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.payrollSettingsService.updateSettings(user.tenantId, updateDto);
  }

  @Post('social-orgs')
  async createSocialOrg(
    @CurrentUser() user: any,
    @Body() createDto: CreateSocialOrgDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.payrollSettingsService.createSocialOrg(user.tenantId, createDto);
  }

  @Get('social-orgs')
  async findAllSocialOrgs(@CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.payrollSettingsService.findAllSocialOrgs(user.tenantId);
  }

  @Delete('social-orgs/:id')
  async deleteSocialOrg(@CurrentUser() user: any, @Param('id') id: string) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.payrollSettingsService.deleteSocialOrg(id, user.tenantId);
  }

  @Get('download-dsn-test')
  async downloadDSNTest(
    @CurrentUser() user: any,
    @Res() res: Response,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Utiliser le mois et l'année actuels si non fournis
    const now = new Date();
    const targetMonth = month || String(now.getMonth() + 1).padStart(2, '0');
    const targetYear = year || String(now.getFullYear());

    try {
      // Générer le fichier DSN
      const dsnContent = await this.dsnGeneratorService.generateMonthlyDSN(
        user.tenantId,
        targetMonth,
        targetYear,
      );

      // Définir les headers pour le téléchargement
      const filename = `DSN_${targetYear}${targetMonth}_${user.tenantId.substring(0, 8)}.dsn`;

      res.setHeader('Content-Type', 'text/plain; charset=iso-8859-1');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(dsnContent, 'utf8'));

      // Envoyer le fichier
      res.send(dsnContent);
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Erreur lors de la génération du fichier DSN',
      );
    }
  }
}
