import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { Expense, ExpenseDocument } from '../billing/purchases/schemas/expense.schema';
import { BankAccount, BankAccountDocument } from '../banking/schemas/bank-account.schema';

@Injectable()
export class ForecastService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async getTreasuryForecast(tenantId: string) {
    const accounts = await this.bankAccountModel.find({ tenantId }).exec();
    let runningBalance = accounts.reduce((s, a: any) => s + (a.balance || 0), 0);

    const invoices = await this.invoiceModel
      .find({ tenantId, status: { $ne: 'paid' } })
      .exec();
    const expenses = await this.expenseModel
      .find({ tenantId, status: { $in: ['pending', 'verified'] } })
      .exec();

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const result: Array<{ month: string; income: number; expenses: number; balance: number; projected: boolean }> = [];

    for (let i = 0; i < 3; i++) {
      const target = new Date();
      target.setMonth(target.getMonth() + i);
      const targetMonth = target.getMonth();
      const targetYear = target.getFullYear();

      const income = invoices
        .filter((inv: any) => {
          const d = inv.dueDate ? new Date(inv.dueDate) : null;
          return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        })
        .reduce((s, inv: any) => s + (inv.amountTTC || inv.netAPayer || 0), 0);

      const expensesTotal = expenses
        .filter((exp: any) => {
          const d = exp.date ? new Date(exp.date) : null;
          return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        })
        .reduce((s, exp: any) => s + (exp.amountTTC || 0), 0);

      runningBalance = runningBalance + income - expensesTotal;

      result.push({
        month: `${monthNames[targetMonth]} ${targetYear}`,
        income,
        expenses: expensesTotal,
        balance: runningBalance,
        projected: true,
      });
    }

    return result;
  }
}