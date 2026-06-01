import {
  Controller, Get, Post, Body, Patch,
  Param, Delete, UseGuards, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AbsencesService } from './absences.service';

@Controller('absences')
@UseGuards(JwtAuthGuard)
export class AbsencesController {
  constructor(private readonly absencesService: AbsencesService) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.absencesService.getStats(user.tenantId);
  }

  @Post()
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.absencesService.create(dto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.absencesService.findAll(user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.absencesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.absencesService.update(id, dto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.absencesService.remove(id, user.tenantId);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.absencesService.approve(id, user.tenantId, user.name);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @CurrentUser() user: any) {
    return this.absencesService.reject(id, user.tenantId);
  }
}