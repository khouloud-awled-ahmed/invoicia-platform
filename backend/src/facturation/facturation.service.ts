import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cra, CraDocument } from './schemas/cra.schema';
import { Invoice, InvoiceDocument } from '../billing/sales/schemas/invoice.schema';

@Injectable()
export class FacturationService {
  constructor(
    @InjectModel(Cra.name) private craModel: Model<CraDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getPendingLines(tenantId: string) {
    const lines = await this.craModel.find({ tenantId, status: 'VALIDATED' }).sort({ date: -1 }).exec();
    return lines.map(l => ({
      id: l._id.toString(),
      projectName: l.projectName,
      consultant: l.intervenantName,
      date: new Date(l.date).toLocaleDateString('fr-FR'),
      hours: l.hours,
      rate: l.rate,
      amount: l.amount,
    }));
  }

  async getStats(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const pending = await this.craModel.aggregate([
      { $match: { tenantId, status: 'VALIDATED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const invoiced = await this.craModel.aggregate([
      { $match: { tenantId, status: 'INVOICED', updatedAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalPending = pending[0]?.total ?? 0;
    const totalInvoiced = invoiced[0]?.total ?? 0;
    return {
      totalMonth: totalPending + totalInvoiced,
      alreadyInvoiced: totalInvoiced,
      month: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    };
  }

  async generateInvoices(craLineIds: string[], tenantId: string) {
    const lines = await this.craModel.find({ _id: { $in: craLineIds }, tenantId, status: 'VALIDATED' }).exec();
    if (lines.length !== craLineIds.length) throw new NotFoundException('One or more CRA lines not found');

    // Group lines by project
    const byProject: Record<string, typeof lines> = {};
    for (const line of lines) {
      const key = line.projectName;
      if (!byProject[key]) byProject[key] = [];
      byProject[key].push(line);
    }

    // Get next invoice number
    const year = new Date().getFullYear();
    const prefix = `FA-${year}-`;
    const last = await this.invoiceModel
      .findOne({ tenantId, number: { $regex: `^${prefix}` } })
      .sort({ number: -1 })
      .exec();
    let nextNum = 1;
    if (last) {
      const parts = last.number.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    const createdInvoices = [];
    for (const [projectName, projectLines] of Object.entries(byProject)) {
      const items = projectLines.map(l => ({
        article: `CRA - ${l.intervenantName}`,
        description: `${l.hours}h x ${l.rate}€/h - ${new Date(l.date).toLocaleDateString('fr-FR')}`,
        quantity: l.hours,
        unitPrice: l.rate,
        discount: 0,
        vatRate: 19,
      }));

      const amountHT = projectLines.reduce((s, l) => s + l.amount, 0);
      const amountTVA = Math.round(amountHT * 0.19 * 1000) / 1000;
      const amountTTC = Math.round((amountHT + amountTVA) * 1000) / 1000;
      const number = `${prefix}${String(nextNum).padStart(4, '0')}`;
      nextNum++;

      const now = new Date();
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await this.invoiceModel.create({
        number,
        date: now,
        dueDate,
        clientId: tenantId,
        client: projectName,
        tenantId,
        items,
        amountHT,
        amountTVA,
        amountTTC,
        netAPayer: amountTTC,
        status: 'pending',
        currency: 'TND',
      });
      createdInvoices.push(invoice);
    }

    // Mark CRA lines as invoiced
    await this.craModel.updateMany(
      { _id: { $in: craLineIds }, tenantId },
      { $set: { status: 'INVOICED' } }
    );

    return { invoiceCount: createdInvoices.length };
  }
}
