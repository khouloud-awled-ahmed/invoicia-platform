import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';

@Injectable()
export class PurchasesService {
  constructor(@InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>) {}

  // ─── DASHBOARD ────────────────────────────────────────────────
  async getDashboard(tenantId: string) {
    const expenses = await this.expenseModel.find({ tenantId }).exec();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalAll = expenses.reduce((sum, e) => sum + (e.amountTTC || 0), 0);
    const thisMonth = expenses
      .filter((e) => new Date(e.date) >= startOfMonth)
      .reduce((sum, e) => sum + (e.amountTTC || 0), 0);

    const pending = expenses.filter((e) => e.status === 'pending').length;
    const verified = expenses.filter((e) => e.status === 'verified').length;

    // Top 5 categories
    const categoryMap: Record<string, number> = {};
    for (const exp of expenses) {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + (exp.amountTTC || 0);
    }
    const top5Categories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 1000) / 1000,
      }));

    // Recent activity (last 5)
    const recentActivity = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: (e as any)._id,
        supplier: e.supplier,
        category: e.category,
        amountTTC: e.amountTTC,
        date: e.date,
        status: e.status,
      }));

    return {
      totalFull: Math.round(totalAll * 1000) / 1000,
      totalInvoices: expenses.length,
      thisMonth: Math.round(thisMonth * 1000) / 1000,
      thisMonthCount: expenses.filter((e) => new Date(e.date) >= startOfMonth).length,
      pending,
      verified,
      top5Categories,
      recentActivity,
    };
  }

  // ─── CREATE ───────────────────────────────────────────────────
  async createExpense(createDto: any, tenantId: string): Promise<Expense> {
    const expense = new this.expenseModel({
      ...createDto,
      tenantId,
      currency: createDto.currency || 'TND',
      date: new Date(createDto.date),
    });
    return expense.save();
  }

  // ─── LIST ─────────────────────────────────────────────────────
  async findAllExpenses(tenantId: string, filters?: any): Promise<Expense[]> {
    const query: any = { tenantId };
    if (filters?.status) query.status = filters.status;
    if (filters?.category) query.category = filters.category;
    if (filters?.supplier) query.supplier = { $regex: filters.supplier, $options: 'i' };
    return this.expenseModel.find(query).sort({ date: -1 }).exec();
  }

  // ─── FIND ONE ─────────────────────────────────────────────────
  async findOneExpense(id: string, tenantId: string): Promise<Expense> {
    const expense = await this.expenseModel.findOne({ _id: id, tenantId }).exec();
    if (!expense) throw new NotFoundException(`Dépense #${id} introuvable`);
    return expense;
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  async updateExpense(id: string, updateDto: any, tenantId: string): Promise<Expense> {
    const updated = await this.expenseModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Dépense #${id} introuvable`);
    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────
  async removeExpense(id: string, tenantId: string): Promise<void> {
    const result = await this.expenseModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) throw new NotFoundException(`Dépense #${id} introuvable`);
  }

  // ─── CHANGE STATUS ────────────────────────────────────────────
  async changeExpenseStatus(
    id: string,
    status: string,
    tenantId: string,
    reason?: string,
  ): Promise<Expense> {
    await this.findOneExpense(id, tenantId);
    const updateData: any = { status };
    if (reason) updateData.notes = reason;
    if (status === 'verified') updateData.approvedBy = 'system';

    const updated = await this.expenseModel
      .findOneAndUpdate({ _id: id, tenantId }, updateData, { new: true })
      .exec();
    return updated!;
  }
}
