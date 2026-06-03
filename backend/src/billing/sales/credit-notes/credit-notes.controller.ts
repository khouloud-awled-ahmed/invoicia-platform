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
import { CreditNotesService } from './credit-notes.service';

@Controller('billing/sales/credit-notes')
@UseGuards(JwtAuthGuard)
export class CreditNotesController {
  constructor(private readonly creditNotesService: CreditNotesService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.creditNotesService.getDashboard(user.tenantId);
  }

  @Get('next-number')
  getNextNumber(@CurrentUser() user: any) {
    return this.creditNotesService.getNextNumber(user.tenantId);
  }

  @Post()
  create(@Body() createDto: any, @CurrentUser() user: any) {
    return this.creditNotesService.create(createDto, user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.creditNotesService.findAll(user.tenantId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return this.creditNotesService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.remove(id, user.tenantId);
  }

  @Patch(':id/validate')
  validate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.validate(id, user.tenantId);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.creditNotesService.archive(id, user.tenantId);
  }
}
