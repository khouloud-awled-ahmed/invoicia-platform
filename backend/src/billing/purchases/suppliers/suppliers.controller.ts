import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { SuppliersService } from './suppliers.service';

@Controller('billing/purchases/suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ─── STATS ────────────────────────────────────────────────────
  // ⚠️ Must be BEFORE :id routes
  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.suppliersService.getStats(user.tenantId);
  }

  // ─── CRUD ─────────────────────────────────────────────────────
  @Post()
  create(@Body() createDto: any, @CurrentUser() user: any) {
    return this.suppliersService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.suppliersService.findAll(user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.suppliersService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.remove(id, user.tenantId);
  }

  // ─── TOGGLE STATUS ────────────────────────────────────────────
  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string, @CurrentUser() user: any) {
    return this.suppliersService.toggleStatus(id, user.tenantId);
  }

  // ─── INTERVENANTS ─────────────────────────────────────────────
  @Post(':id/intervenants/:intervenantId')
  addIntervenant(
    @Param('id') id: string,
    @Param('intervenantId') intervenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.suppliersService.addIntervenant(id, intervenantId, user.tenantId);
  }

  @Delete(':id/intervenants/:intervenantId')
  removeIntervenant(
    @Param('id') id: string,
    @Param('intervenantId') intervenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.suppliersService.removeIntervenant(id, intervenantId, user.tenantId);
  }
}
