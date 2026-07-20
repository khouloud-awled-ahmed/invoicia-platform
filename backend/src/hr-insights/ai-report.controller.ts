import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AiReportService } from './ai-report.service';

@Controller('hr-insights/ai-report')
@UseGuards(JwtAuthGuard)
export class AiReportController {
  constructor(private readonly aiReportService: AiReportService) {}

  @Get()
  getReport(@CurrentUser() user: any) {
    return this.aiReportService.generateMonthlyReport(user.tenantId);
  }
}
