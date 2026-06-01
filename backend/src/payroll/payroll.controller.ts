import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PayrollService } from './payroll.service';
@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}
  @Post('bulletins')
  create(@Body() dto: any, @CurrentUser() user: any) {
    return this.payrollService.create(dto, user.tenantId);
  }
  @Get('bulletins')
  findAll(@CurrentUser() user: any) {
    return this.payrollService.findAll(user.tenantId);
  }
  @Patch('bulletins/:id/validate')
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.validate(id, user.tenantId);
  }
  @Patch('bulletins/:id/pay')
  pay(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.pay(id, user.tenantId);
  }
}
