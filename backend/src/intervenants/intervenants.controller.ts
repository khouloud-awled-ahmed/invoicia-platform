import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, NotFoundException } from '@nestjs/common';
import { IntervenantsService } from './intervenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('intervenants')
export class IntervenantsController {
  constructor(private readonly intervenantsService: IntervenantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: any, @CurrentUser() user: any) {
    return this.intervenantsService.create(createDto, user.tenantId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.intervenantsService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.intervenantsService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.intervenantsService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.intervenantsService.remove(id, user.tenantId);
  }

  @Post(':id/generate-cra-token')
  @UseGuards(JwtAuthGuard)
  generateCRAToken(@Param('id') id: string, @CurrentUser() user: any) {
    return this.intervenantsService.generateCRAAccessToken(id, user.tenantId);
  }

  // Endpoint public pour obtenir les infos d'un intervenant par token
  @Get('public/by-token/:token')
  async findByToken(@Param('token') token: string) {
    const intervenant = await this.intervenantsService.findByCRAToken(token);
    if (!intervenant) {
      throw new NotFoundException('Token invalide ou intervenant non trouvé');
    }
    // Retourner seulement les infos nécessaires (pas le token lui-même)
    return {
      id: (intervenant as any)._id?.toString(),
      firstName: intervenant.firstName,
      lastName: intervenant.lastName,
      email: intervenant.email,
      type: intervenant.type,
      supplierName: intervenant.supplierName,
    };
  }
}
