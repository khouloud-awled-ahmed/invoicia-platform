import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReconciliationService } from './reconciliation.service';
import { MatchReconciliationDto } from './dto/match-reconciliation.dto';

@Controller('reconciliation')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  /**
   * GET /reconciliation/open-items
   * Liste des candidats au rapprochement : factures en attente, dépenses vérifiées, paie (si dispo).
   */
  @Get('open-items')
  async getOpenItems(@CurrentUser() user: any) {
    if (!user.tenantId) {
      return { invoices: [], expenses: [], payrolls: [] };
    }
    return this.reconciliationService.getOpenItems(user.tenantId);
  }

  /**
   * POST /reconciliation/match
   * Body: { bankTransactionId, targetId, targetType: 'INVOICE' | 'EXPENSE' | 'PAYROLL' }
   * Rapproche une ligne bancaire avec un justificatif et crée l'écriture comptable.
   */
  @Post('match')
  async match(@CurrentUser() user: any, @Body() dto: MatchReconciliationDto) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.reconciliationService.match(
      user.tenantId,
      dto.bankTransactionId,
      dto.targetId,
      dto.targetType,
    );
  }
}
