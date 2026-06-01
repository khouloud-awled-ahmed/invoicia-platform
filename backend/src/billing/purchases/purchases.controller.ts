import {
  Controller, Get, Post, Body, Patch,
  Param, Delete, UseGuards, Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ModuleAccessGuard } from '../guards/module-access.guard';
import { PurchasesService } from './purchases.service';

@Controller('billing/purchases')
@UseGuards(JwtAuthGuard, ModuleAccessGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ─── DASHBOARD ────────────────────────────────────────────────
  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.purchasesService.getDashboard(user.tenantId);
  }

  // ─── EXPENSES CRUD ────────────────────────────────────────────
  @Post('expenses')
  createExpense(@Body() dto: any, @CurrentUser() user: any) {
    return this.purchasesService.createExpense(dto, user.tenantId);
  }

  @Get('expenses')
  findAllExpenses(@CurrentUser() user: any, @Query() query: any) {
    return this.purchasesService.findAllExpenses(user.tenantId, query);
  }

  @Get('expenses/:id')
  findOneExpense(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchasesService.findOneExpense(id, user.tenantId);
  }

  @Patch('expenses/:id')
  updateExpense(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.purchasesService.updateExpense(id, dto, user.tenantId);
  }

  @Delete('expenses/:id')
  removeExpense(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchasesService.removeExpense(id, user.tenantId);
  }

  // ─── STATUS ACTIONS ───────────────────────────────────────────
  @Patch('expenses/:id/verify')
  verifyExpense(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchasesService.changeExpenseStatus(id, 'verified', user.tenantId);
  }

  @Patch('expenses/:id/export')
  exportExpense(@Param('id') id: string, @CurrentUser() user: any) {
    return this.purchasesService.changeExpenseStatus(id, 'exported', user.tenantId);
  }

  @Patch('expenses/:id/reject')
  rejectExpense(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @CurrentUser() user: any,
  ) {
    return this.purchasesService.changeExpenseStatus(id, 'rejected', user.tenantId, body.reason);
  }
}