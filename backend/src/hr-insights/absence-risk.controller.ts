import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AbsenceRiskService } from './absence-risk.service';

@Controller('hr-insights/absence-risk')
@UseGuards(JwtAuthGuard)
export class AbsenceRiskController {
  constructor(private readonly riskService: AbsenceRiskService) {}

  @Get()
  getAll(@CurrentUser() user: any) {
    return this.riskService.computeAllRiskScores(user.tenantId);
  }

  @Get('high-risk')
  getHighRisk(@CurrentUser() user: any) {
    return this.riskService.getHighRiskEmployees(user.tenantId);
  }
}
