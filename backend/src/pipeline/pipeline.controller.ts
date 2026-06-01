import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  findAll(@Request() req) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.pipelineService.create(body, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.pipelineService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pipelineService.delete(id);
  }
}
