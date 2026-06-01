import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EvaluationsService } from './evaluations.service';
@Controller('evaluations')
@UseGuards(JwtAuthGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}
  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.evaluationsService.create(dto, user.tenantId);
  }
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.evaluationsService.findAll(user.tenantId);
  }
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationsService.remove(id, user.tenantId);
  }
}
