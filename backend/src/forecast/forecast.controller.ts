import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ForecastService } from './forecast.service';

@Controller('forecast')
@UseGuards(JwtAuthGuard)
export class ForecastController {
  constructor(private readonly forecastService: ForecastService) {}

  @Get('treasury')
  getTreasuryForecast(@CurrentUser() user: any) {
    return this.forecastService.getTreasuryForecast(user.tenantId);
  }
}