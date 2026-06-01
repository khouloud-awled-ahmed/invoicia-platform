import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FormationsService } from './formations.service';
@Controller('formations')
@UseGuards(JwtAuthGuard)
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}
  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.formationsService.create(dto, user.tenantId);
  }
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.formationsService.findAll(user.tenantId);
  }
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any, @CurrentUser() user: any) {
    return this.formationsService.updateStatus(id, body.statut, user.tenantId);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.formationsService.remove(id, user.tenantId);
  }
}
