import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreditNote, CreditNoteDocument } from '../../../credit-notes/schemas/credit-note.schema';

@Injectable()
export class CreditNotesService {
  constructor(
    @InjectModel(CreditNote.name) private creditNoteModel: Model<CreditNoteDocument>,
  ) {}

  // ─── HELPERS ──────────────────────────────────────────────────
  private calculateTotals(items: any[]) {
    const amountHT = items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
      return sum + lineTotal;
    }, 0);
    const amountTVA = items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
      return sum + (lineTotal * (item.vatRate || 19) / 100);
    }, 0);
    return {
      amountHT: Math.round(amountHT * 1000) / 1000,
      amountTVA: Math.round(amountTVA * 1000) / 1000,
      amountTTC: Math.round((amountHT + amountTVA) * 1000) / 1000,
    };
  }

  // ─── AUTO GENERATE NUMBER ─────────────────────────────────────
  private async generateNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `AV-${year}-`;

    // Get ALL numbers and find the real maximum
    const all = await this.creditNoteModel
      .find({ tenantId, number: { $regex: `^${prefix}` } })
      .select('number')
      .exec();

    let max = 0;
    for (const doc of all) {
      const parts = doc.number.split('-');
      const num = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(num) && num > max) max = num;
    }

    // Keep incrementing until we find a number that doesn't exist
    let next = max + 1;
    let candidate = `${prefix}${String(next).padStart(4, '0')}`;
    while (await this.creditNoteModel.findOne({ tenantId, number: candidate }).exec()) {
      next++;
      candidate = `${prefix}${String(next).padStart(4, '0')}`;
    }

    return candidate;
  }
  // ─── NEXT NUMBER (for frontend) ───────────────────────────────
  async getNextNumber(tenantId: string): Promise<{ number: string }> {
    const number = await this.generateNumber(tenantId);
    return { number };
  }

  // ─── CREATE ───────────────────────────────────────────────────
  async create(createDto: any, tenantId: string): Promise<CreditNote> {
    // Auto-generate number if frontend didn't send one
    const number = createDto.number || await this.generateNumber(tenantId);

    // Calculate amounts from amountHT + tvaRate if no items provided
    let totals: any = {};
    if (createDto.items && createDto.items.length > 0) {
      totals = this.calculateTotals(createDto.items);
    } else if (createDto.amountHT !== undefined) {
      // Frontend sends amountHT + tvaRate directly (simple form without items)
      const amountHT = parseFloat(createDto.amountHT) || 0;
      const tvaRate = parseFloat(createDto.tvaRate) || 19;
      const amountTVA = Math.round(amountHT * (tvaRate / 100) * 1000) / 1000;
      const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
      totals = { amountHT, amountTVA, amountTTC };
    }

    const creditNote = new this.creditNoteModel({
      ...createDto,
      number,
      tenantId,
      currency: createDto.currency || 'TND',
      date: new Date(createDto.date),
      ...totals,
    });

    return creditNote.save();
  }

  // ─── LIST ─────────────────────────────────────────────────────
  async findAll(tenantId: string, filters?: any): Promise<CreditNote[]> {
    const query: any = { tenantId };
    if (filters?.status) query.status = filters.status;
    if (filters?.clientId) query.clientId = filters.clientId;
    if (filters?.relatedInvoiceId) query.relatedInvoiceId = filters.relatedInvoiceId;
    return this.creditNoteModel.find(query).sort({ date: -1 }).exec();
  }

  // ─── FIND ONE ─────────────────────────────────────────────────
  async findOne(id: string, tenantId: string): Promise<CreditNote> {
    const creditNote = await this.creditNoteModel.findOne({ _id: id, tenantId }).exec();
    if (!creditNote) {
      throw new NotFoundException(`Avoir #${id} introuvable`);
    }
    return creditNote;
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  async update(id: string, updateDto: any, tenantId: string): Promise<CreditNote> {
    if (updateDto.items && updateDto.items.length > 0) {
      const totals = this.calculateTotals(updateDto.items);
      updateDto = { ...updateDto, ...totals };
    } else if (updateDto.amountHT !== undefined) {
      const amountHT = parseFloat(updateDto.amountHT) || 0;
      const tvaRate = parseFloat(updateDto.tvaRate) || 19;
      const amountTVA = Math.round(amountHT * (tvaRate / 100) * 1000) / 1000;
      const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
      updateDto = { ...updateDto, amountHT, amountTVA, amountTTC };
    }

    const updated = await this.creditNoteModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Avoir #${id} introuvable`);
    }
    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────
  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.creditNoteModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Avoir #${id} introuvable`);
    }
  }

  // ─── VALIDATE ─────────────────────────────────────────────────
  async validate(id: string, tenantId: string): Promise<CreditNote> {
    const creditNote = await this.findOne(id, tenantId);
    if (creditNote.status !== 'draft') {
      throw new BadRequestException('Seuls les avoirs en brouillon peuvent être validés');
    }
    const updated = await this.creditNoteModel
      .findOneAndUpdate({ _id: id, tenantId }, { status: 'validated' }, { new: true })
      .exec();
    return updated!;
  }

  // ─── ARCHIVE ──────────────────────────────────────────────────
  async archive(id: string, tenantId: string): Promise<CreditNote> {
    const creditNote = await this.findOne(id, tenantId);
    if (creditNote.status === 'archived') {
      throw new BadRequestException('Cet avoir est déjà archivé');
    }
    const updated = await this.creditNoteModel
      .findOneAndUpdate({ _id: id, tenantId }, { status: 'archived' }, { new: true })
      .exec();
    return updated!;
  }

  // ─── DASHBOARD STATS ──────────────────────────────────────────
  async getDashboard(tenantId: string) {
    const creditNotes = await this.creditNoteModel.find({ tenantId }).exec();
    const total = creditNotes.reduce((sum, cn) => sum + (cn.amountTTC || 0), 0);

    const statuses = ['draft', 'pending', 'validated', 'archived'];
    const distribution = statuses.map(status => ({
      status,
      count: creditNotes.filter(cn => cn.status === status).length,
      total: creditNotes
        .filter(cn => cn.status === status)
        .reduce((sum, cn) => sum + (cn.amountTTC || 0), 0),
    }));

    return {
      total: Math.round(total * 1000) / 1000,
      count: creditNotes.length,
      statusDistribution: distribution,
    };
  }
}