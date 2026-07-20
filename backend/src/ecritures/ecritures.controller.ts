import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EcrituresService } from './ecritures.service';
@Controller('ecritures')
@UseGuards(JwtAuthGuard)
export class EcrituresController {
  constructor(private readonly ecrituresService: EcrituresService) {}
  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.ecrituresService.create(dto, user.tenantId);
  }
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ecrituresService.findAll(user.tenantId);
  }

  @Get('balance')
  getBalance(@CurrentUser() user: any) {
    return this.ecrituresService.getBalance(user.tenantId);
  }

  @Get('grand-livre')
  getGrandLivre(@CurrentUser() user: any) {
    return this.ecrituresService.getGrandLivre(user.tenantId);
  }

  @Get('compte-resultat')
  getCompteDeResultat(@CurrentUser() user: any) {
    return this.ecrituresService.getCompteDeResultat(user.tenantId);
  }

  @Get('export-fec')
  async exportFEC(@CurrentUser() user: any) {
    const content = await this.ecrituresService.exportFEC(user.tenantId);
    return { content };
  }

  @Get('bilan')
  getBilan(@CurrentUser() user: any) {
    return this.ecrituresService.getBilan(user.tenantId);
  }

  @Get('declaration-tva')
  getDeclarationTVA(@CurrentUser() user: any) {
    return this.ecrituresService.getDeclarationTVA(user.tenantId);
  }
}
