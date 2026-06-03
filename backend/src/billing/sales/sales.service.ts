import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { Client, ClientDocument } from '../../clients/schemas/client.schema';
import { Project, ProjectDocument } from '../../projects/schemas/project.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  // ─── HELPERS ──────────────────────────────────────────────────
  private calculateInvoiceAmounts(items: any[]) {
    let amountHT = 0;
    let amountTVA = 0;

    for (const item of items) {
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const discount = item.discount || 0;
      const vatRate = item.vatRate ?? 19; // Tunisia standard

      const itemHT = quantity * unitPrice * (1 - discount / 100);
      amountHT += itemHT;
      amountTVA += itemHT * (vatRate / 100);
    }

    const amountTTC = amountHT + amountTVA;
    return {
      amountHT: Math.round(amountHT * 1000) / 1000,
      amountTVA: Math.round(amountTVA * 1000) / 1000,
      amountTTC: Math.round(amountTTC * 1000) / 1000,
    };
  }

  // ─── DASHBOARD ────────────────────────────────────────────────
  async getDashboard(tenantId: string) {
    const invoices = await this.invoiceModel.find({ tenantId }).exec();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalCA = invoices
      .filter((i) => !['cancelled', 'archived'].includes(i.status))
      .reduce((sum, i) => sum + (i.amountTTC || 0), 0);

    const thisMonth = invoices
      .filter(
        (i) => new Date(i.date) >= startOfMonth && !['cancelled', 'archived'].includes(i.status),
      )
      .reduce((sum, i) => sum + (i.amountTTC || 0), 0);

    const pending = invoices.filter((i) => i.status === 'pending').length;
    const validated = invoices.filter((i) => i.status === 'validated').length;

    // Top 5 clients by revenue
    const clientMap: Record<string, number> = {};
    for (const inv of invoices) {
      if (!['cancelled', 'archived'].includes(inv.status)) {
        clientMap[inv.client] = (clientMap[inv.client] || 0) + (inv.amountTTC || 0);
      }
    }
    const top5Clients = Object.entries(clientMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([client, total]) => ({
        client,
        total: Math.round(total * 1000) / 1000,
        percentage: totalCA > 0 ? Math.round((total / totalCA) * 1000) / 10 : 0,
      }));

    // Status distribution
    const statuses = ['draft', 'pending', 'validated', 'paid', 'cancelled', 'archived'];
    const statusDistribution = statuses.map((status) => ({
      status,
      count: invoices.filter((i) => i.status === status).length,
      total: invoices
        .filter((i) => i.status === status)
        .reduce((sum, i) => sum + (i.amountTTC || 0), 0),
    }));

    return {
      totalCA: Math.round(totalCA * 1000) / 1000,
      totalInvoices: invoices.length,
      thisMonth: Math.round(thisMonth * 1000) / 1000,
      thisMonthCount: invoices.filter((i) => new Date(i.date) >= startOfMonth).length,
      pending,
      validated,
      top5Clients,
      statusDistribution,
    };
  }

  // ─── NEXT INVOICE NUMBER ──────────────────────────────────────
  async getNextInvoiceNumber(tenantId: string): Promise<{ number: string }> {
    const year = new Date().getFullYear();
    const prefix = `FA-${year}-`;

    const last = await this.invoiceModel
      .findOne({ tenantId, number: { $regex: `^${prefix}` } })
      .sort({ number: -1 })
      .exec();

    let next = 1;
    if (last) {
      const parts = last.number.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) next = lastNum + 1;
    }

    return { number: `${prefix}${String(next).padStart(4, '0')}` };
  }

  // ─── CREATE ───────────────────────────────────────────────────
  async createInvoice(createInvoiceDto: CreateInvoiceDto, tenantId: string): Promise<Invoice> {
    if (!tenantId) throw new BadRequestException('Tenant ID is required');

    const existingInvoice = await this.invoiceModel
      .findOne({ tenantId, number: createInvoiceDto.number })
      .exec();
    if (existingInvoice) {
      throw new BadRequestException(
        `Une facture avec le numéro ${createInvoiceDto.number} existe déjà`,
      );
    }

    // Normalize French status to English
    const statusMap: Record<string, string> = {
      Brouillon: 'draft',
      'En attente': 'pending',
      Validée: 'validated',
      Payée: 'paid',
      Annulée: 'cancelled',
      Archivée: 'archived',
    };
    if (createInvoiceDto.status && statusMap[createInvoiceDto.status]) {
      (createInvoiceDto as any).status = statusMap[createInvoiceDto.status];
    }

    const normalizedItems = createInvoiceDto.items.map((item) => ({
      ...item,
      article: item.article || item.description || 'Article',
      description: item.description || item.article || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      discount: item.discount || 0,
      vatRate: item.vatRate ?? 19,
    }));

    const { amountHT, amountTVA, amountTTC } = this.calculateInvoiceAmounts(normalizedItems);
    const timbreFiscal = createInvoiceDto.timbreFiscal || 0;
    const withholdingAmount = createInvoiceDto.withholdingAmount || 0;
    const netAPayer = Math.round((amountTTC + timbreFiscal - withholdingAmount) * 1000) / 1000;

    const newInvoice = new this.invoiceModel({
      ...createInvoiceDto,
      items: normalizedItems,
      tenantId,
      amountHT,
      amountTVA,
      amountTTC,
      timbreFiscal,
      withholdingAmount,
      netAPayer,
      currency: createInvoiceDto.currency || 'TND',
      date:
        typeof createInvoiceDto.date === 'string'
          ? new Date(createInvoiceDto.date)
          : createInvoiceDto.date,
      dueDate:
        typeof createInvoiceDto.dueDate === 'string'
          ? new Date(createInvoiceDto.dueDate)
          : createInvoiceDto.dueDate,
    });

    try {
      return await newInvoice.save();
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        throw new BadRequestException(`Une facture avec ce ${field} existe déjà`);
      }
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors || {})
          .map((e: any) => e.message)
          .join(', ');
        throw new BadRequestException(`Erreur de validation: ${messages}`);
      }
      throw error;
    }
  }

  // ─── LIST ─────────────────────────────────────────────────────
  async findAllInvoices(tenantId: string, filters?: any): Promise<Invoice[]> {
    const query: any = { tenantId };
    if (filters?.status) query.status = filters.status;
    if (filters?.clientId) query.clientId = filters.clientId;
    return this.invoiceModel.find(query).sort({ date: -1 }).exec();
  }

  // ─── FIND ONE ─────────────────────────────────────────────────
  async findOneInvoice(id: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.invoiceModel.findOne({ _id: id, tenantId }).exec();
    if (!invoice) throw new NotFoundException(`Facture #${id} introuvable`);
    return invoice;
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  async updateInvoice(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    tenantId: string,
  ): Promise<Invoice> {
    let extra: any = {};

    if (updateInvoiceDto.items) {
      const normalizedItems = updateInvoiceDto.items.map((item) => ({
        ...item,
        article: item.article || item.description || 'Article',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        discount: item.discount || 0,
        vatRate: item.vatRate ?? 19,
      }));
      const { amountHT, amountTVA, amountTTC } = this.calculateInvoiceAmounts(normalizedItems);
      const timbreFiscal = updateInvoiceDto.timbreFiscal || 0;
      const withholdingAmount = updateInvoiceDto.withholdingAmount || 0;
      extra = {
        items: normalizedItems,
        amountHT,
        amountTVA,
        amountTTC,
        netAPayer: Math.round((amountTTC + timbreFiscal - withholdingAmount) * 1000) / 1000,
      };
    }

    const updatedInvoice = await this.invoiceModel
      .findOneAndUpdate({ _id: id, tenantId }, { ...updateInvoiceDto, ...extra }, { new: true })
      .exec();

    if (!updatedInvoice) throw new NotFoundException(`Facture #${id} introuvable`);
    return updatedInvoice;
  }

  // ─── DELETE ───────────────────────────────────────────────────
  async removeInvoice(id: string, tenantId: string): Promise<Invoice> {
    const deletedInvoice = await this.invoiceModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!deletedInvoice) throw new NotFoundException(`Facture #${id} introuvable`);
    return deletedInvoice;
  }

  // ─── CHANGE STATUS ────────────────────────────────────────────
  async changeInvoiceStatus(id: string, status: string, tenantId: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id, tenantId);

    const allowed: Record<string, string[]> = {
      draft: ['pending', 'validated', 'cancelled'],
      pending: ['validated', 'cancelled', 'draft'],
      validated: ['paid', 'cancelled', 'archived'],
      paid: ['archived'],
      cancelled: [],
      archived: [],
    };

    if (!allowed[invoice.status]?.includes(status)) {
      throw new BadRequestException(`Transition "${invoice.status}" → "${status}" non autorisée`);
    }

    const updated = await this.invoiceModel
      .findOneAndUpdate({ _id: id, tenantId }, { status }, { new: true })
      .exec();
    return updated!;
  }

  // ─── CANCEL ───────────────────────────────────────────────────
  async cancelInvoice(id: string, reason: string | undefined, tenantId: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id, tenantId);
    if (['cancelled', 'archived'].includes(invoice.status)) {
      throw new BadRequestException('Cette facture est déjà annulée ou archivée');
    }

    const updated = await this.invoiceModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { status: 'cancelled', cancellationReason: reason, cancelledAt: new Date() },
        { new: true },
      )
      .exec();
    return updated!;
  }
}
