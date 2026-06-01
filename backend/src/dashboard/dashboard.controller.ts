import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return { employees: 0, totalRevenue: 0, pendingInvoices: 0, treasuryBalance: 0, expenses: 0 };
    return this.dashboardService.getSummary(user.tenantId, months ? parseInt(months) : 0);
  }

  @Get('revenue-by-month')
  async getRevenueByMonth(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return [];
    return this.dashboardService.getRevenueByMonth(user.tenantId, months ? parseInt(months) : 12);
  }

  @Get('top-clients')
  async getTopClients(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return [];
    return this.dashboardService.getTopClients(user.tenantId, months ? parseInt(months) : 0);
  }

  @Get('invoice-stats')
  async getInvoiceStats(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return {};
    return this.dashboardService.getInvoiceStats(user.tenantId, months ? parseInt(months) : 0);
  }

  @Get('expenses-by-category')
  async getExpensesByCategory(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return [];
    return this.dashboardService.getExpensesByCategory(user.tenantId, months ? parseInt(months) : 0);
  }

  @Get('cash-flow')
  async getCashFlow(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return [];
    return this.dashboardService.getCashFlow(user.tenantId, months ? parseInt(months) : 6);
  }

  @Get('ai-insights')
  async getAIInsights(@CurrentUser() user: any, @Query('months') months?: string) {
    if (!user.tenantId) return [];
    return this.dashboardService.getAIInsights(user.tenantId, months ? parseInt(months) : 0);
  }
}
