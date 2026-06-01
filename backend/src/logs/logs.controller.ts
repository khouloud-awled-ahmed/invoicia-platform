import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { TechnicalAdminGuard } from './guards/technical-admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilterLogsDto } from './dto/filter-logs.dto';

@Controller('logs')
@UseGuards(JwtAuthGuard, TechnicalAdminGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll(
    @Query() filters: FilterLogsDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const parsedFilters = {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    };

    return this.logsService.findAll(parsedFilters, page, limit);
  }

  @Get('stats')
  async getStats(@Query('timeRange') timeRange: '24h' | '7d' | '30d' = '24h') {
    return this.logsService.getStats(timeRange);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.logsService.findOne(id);
  }

  @Patch(':id/resolve')
  async markAsResolved(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @CurrentUser() user: any,
  ) {
    return this.logsService.markAsResolved(id, user.userId, notes);
  }

  @Get('cleanup/old')
  async cleanupOldLogs(
    @Query('daysToKeep', new DefaultValuePipe(90), ParseIntPipe) daysToKeep: number,
  ) {
    const deletedCount = await this.logsService.deleteOldLogs(daysToKeep);
    return {
      message: `Deleted ${deletedCount} old log entries`,
      deletedCount,
    };
  }
}
