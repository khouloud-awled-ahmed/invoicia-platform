import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AccountingService } from './accounting.service';

@Controller('billing/accounting')
@UseGuards(JwtAuthGuard)
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post()
  create(@Body() createDto: any, @CurrentUser() user: any) {
    return this.accountingService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.accountingService.findAll(user.tenantId, filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountingService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.accountingService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.accountingService.remove(id, user.tenantId);
  }
}
