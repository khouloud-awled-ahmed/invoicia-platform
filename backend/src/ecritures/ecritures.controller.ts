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
}
