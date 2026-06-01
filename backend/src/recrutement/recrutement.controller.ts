import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RecrutementService } from './recrutement.service';
@Controller('recrutement')
@UseGuards(JwtAuthGuard)
export class RecrutementController {
  constructor(private readonly recrutementService: RecrutementService) {}
  @Post('offres')
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.recrutementService.create(dto, user.tenantId);
  }
  @Get('offres')
  findAll(@CurrentUser() user: any) {
    return this.recrutementService.findAll(user.tenantId);
  }
  @Patch('offres/:id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.recrutementService.updateStatus(id, body.statut, user.tenantId);
  }
}
