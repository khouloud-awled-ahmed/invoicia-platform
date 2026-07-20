import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Budget, BudgetDocument } from './schemas/budget.schema';
import { Ecriture, EcritureDocument } from '../ecritures/schemas/ecriture.schema';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
    @InjectModel(Ecriture.name) private ecritureModel: Model<EcritureDocument>,
  ) {}

  async create(dto: any, tenantId: string) {
    return new this.budgetModel({ ...dto, tenantId }).save();
  }

  async remove(id: string, tenantId: string) {
    return this.budgetModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  async findAllWithActuals(tenantId: string) {
    const budgets = await this.budgetModel.find({ tenantId }).exec();
    const entries = await this.ecritureModel.find({ tenantId }).exec();

    const actualByAccount: Record<string, number> = {};
    for (const e of entries) {
      const key = e.compte || 'INCONNU';
      actualByAccount[key] = (actualByAccount[key] || 0) + (e.debit || 0);
    }

    return budgets.map((b: any) => {
      const actual = actualByAccount[b.account] || 0;
      const variance = b.budgeted - actual;
      const variancePercent = b.budgeted > 0 ? (variance / b.budgeted) * 100 : 0;
      return {
        id: b._id.toString(),
        account: b.account,
        accountLabel: b.accountLabel,
        period: b.period,
        budgeted: b.budgeted,
        actual,
        variance,
        variancePercent,
      };
    });
  }

  async getSummary(tenantId: string) {
    const all = await this.findAllWithActuals(tenantId);
    const totalBudget = all.reduce((s, b) => s + b.budgeted, 0);
    const totalActual = all.reduce((s, b) => s + b.actual, 0);
    const overBudgetCount = all.filter((b) => b.variancePercent < -10).length;
    return {
      totalBudget,
      totalActual,
      ecart: totalBudget - totalActual,
      overBudgetCount,
    };
  }
}