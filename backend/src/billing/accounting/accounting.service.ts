import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AccountingEntry,
  AccountingEntryDocument,
} from '../../accounting/schemas/accounting-entry.schema';
import { Ecriture, EcritureDocument } from '../../ecritures/schemas/ecriture.schema';
import { Project, ProjectDocument } from '../../projects/schemas/project.schema';

@Injectable()
export class AccountingService {
  constructor(
    @InjectModel(AccountingEntry.name) private accountingEntryModel: Model<AccountingEntryDocument>,
    @InjectModel(Ecriture.name) private ecritureModel: Model<EcritureDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createDto: any, tenantId: string): Promise<AccountingEntry> {
    const entry = new this.accountingEntryModel({
      ...createDto,
      tenantId,
      date: new Date(createDto.date),
    });
    return entry.save();
  }

  async findAll(tenantId: string, filters?: any): Promise<AccountingEntry[]> {
    const query: any = { tenantId };
    if (filters?.account) query.account = filters.account;
    return this.accountingEntryModel.find(query).sort({ date: -1 }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<AccountingEntry> {
    const entry = await this.accountingEntryModel.findOne({ _id: id, tenantId }).exec();
    if (!entry) {
      throw new NotFoundException(`Accounting entry with ID ${id} not found`);
    }
    return entry;
  }

  async update(id: string, updateDto: any, tenantId: string): Promise<AccountingEntry> {
    const updated = await this.accountingEntryModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Accounting entry with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.accountingEntryModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Accounting entry with ID ${id} not found`);
    }
  }

  async getAnalyticsByProject(tenantId: string): Promise<any[]> {
    const entries = await this.ecritureModel
      .find({ tenantId, projectId: { $exists: true, $ne: null } })
      .exec();

    const grouped: Record<string, { revenue: number; expenses: number }> = {};
    for (const e of entries) {
      const pid = (e as any).projectId;
      if (!grouped[pid]) grouped[pid] = { revenue: 0, expenses: 0 };
      grouped[pid].revenue += e.credit || 0;
      grouped[pid].expenses += e.debit || 0;
    }

    const projectIds = Object.keys(grouped);
    const projects = await this.projectModel.find({ _id: { $in: projectIds } }).exec();
    const nameMap: Record<string, string> = {};
    projects.forEach((p: any) => { nameMap[p._id.toString()] = p.name; });

    return Object.entries(grouped).map(([projectId, v]) => ({
      projectId,
      projectName: nameMap[projectId] || projectId,
      revenue: v.revenue,
      expenses: v.expenses,
      margin: v.revenue - v.expenses,
      marginPercent: v.revenue > 0 ? ((v.revenue - v.expenses) / v.revenue) * 100 : 0,
    }));
  }
}
