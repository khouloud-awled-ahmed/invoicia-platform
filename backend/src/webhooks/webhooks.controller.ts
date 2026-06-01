import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get() findAll(@Req() req: any) {
    return this.webhooksService.findAll(req.user.tenantId);
  }

  @Post() create(@Req() req: any, @Body() dto: any) {
    return this.webhooksService.create(req.user.tenantId, dto);
  }

  @Put(':id') update(@Param('id') id: string, @Req() req: any, @Body() dto: any) {
    return this.webhooksService.update(id, req.user.tenantId, dto);
  }

  @Delete(':id') remove(@Param('id') id: string, @Req() req: any) {
    return this.webhooksService.remove(id, req.user.tenantId);
  }
}
