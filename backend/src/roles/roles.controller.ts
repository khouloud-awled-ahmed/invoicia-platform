import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(@Request() req) {
    const tenantId = req.user.tenantId;
    await this.rolesService.seedDefaultRoles(tenantId);
    return this.rolesService.findAll(tenantId);
  }

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.rolesService.create(req.user.tenantId, body);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.rolesService.update(id, req.user.tenantId, body);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    return this.rolesService.delete(id, req.user.tenantId);
  }
}