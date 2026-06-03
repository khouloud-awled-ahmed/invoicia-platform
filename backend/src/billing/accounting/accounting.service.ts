import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AccountingEntry,
  AccountingEntryDocument,
} from '../../accounting/schemas/accounting-entry.schema';

@Injectable()
export class AccountingService {
  constructor(
    @InjectModel(AccountingEntry.name) private accountingEntryModel: Model<AccountingEntryDocument>,
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
}
