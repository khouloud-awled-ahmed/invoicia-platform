import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PlatformInvoice,
  PlatformInvoiceDocument,
  PlatformInvoiceStatus,
  PlatformInvoicePaymentMethod,
} from '../schemas/platform-invoice.schema';
import { PlatformSettings, PlatformSettingsDocument } from '../schemas/platform-settings.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { SubscriptionPlan, SubscriptionPlanDocument } from '../schemas/subscription-plan.schema';
import { InvoiceGeneratorService } from '../invoice-generator/invoice-generator.service';
import { InvoiceEmailService } from '../invoice-generator/invoice-email.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PlatformInvoicesService {
  private readonly logger = new Logger(PlatformInvoicesService.name);

  constructor(
    @InjectModel(PlatformInvoice.name) private invoiceModel: Model<PlatformInvoiceDocument>,
    @InjectModel(PlatformSettings.name) private settingsModel: Model<PlatformSettingsDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(SubscriptionPlan.name) private planModel: Model<SubscriptionPlanDocument>,
    private invoiceGenerator: InvoiceGeneratorService,
    private invoiceEmailService: InvoiceEmailService,
  ) {}

  /**
   * Génère le prochain numéro de facture séquentiel
   */
  private async generateInvoiceNumber(): Promise<string> {
    const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
    if (!settings) {
      throw new NotFoundException('Platform settings not found');
    }

    const currentYear = new Date().getFullYear();
    const prefix = settings.invoicePrefix || 'INV';
    const yearPrefix = `${prefix}-${currentYear}-`;

    // Si nextInvoiceNumber n'existe pas ou est à 0, chercher le dernier numéro
    if (!settings.nextInvoiceNumber || settings.nextInvoiceNumber === 0) {
      const lastInvoice = await this.invoiceModel
        .findOne({ invoiceNumber: new RegExp(`^${yearPrefix}`) })
        .sort({ invoiceNumber: -1 })
        .exec();

      if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
        settings.nextInvoiceNumber = lastNumber + 1;
      } else {
        settings.nextInvoiceNumber = 1;
      }
    }

    const invoiceNumber = `${yearPrefix}${settings.nextInvoiceNumber.toString().padStart(3, '0')}`;

    // Incrémenter pour la prochaine facture
    settings.nextInvoiceNumber++;
    await settings.save();

    return invoiceNumber;
  }

  /**
   * Crée une facture pour un abonnement
   */
  async createInvoice(
    tenantId: string,
    planId: string,
    amount: number,
    paymentMethod: PlatformInvoicePaymentMethod,
    promoCode?: string,
    discountAmount?: number,
    subtotal?: number,
  ): Promise<PlatformInvoiceDocument> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const plan = await this.planModel.findById(planId).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    // Créer un snapshot des données au moment de la facturation
    const tenantSnapshot = {
      name: tenant.name,
      businessName: tenant.businessName,
      email: tenant.email,
      adminEmail: tenant.adminEmail,
      address: tenant.settings?.companyAddress,
      matriculeFiscal: tenant.matriculeFiscal,
      vatNumber: tenant.settings?.vatNumber || tenant.tvaNumber,
    };

    const planSnapshot = {
      name: plan.name,
      price: plan.price,
      currency: plan.currency || 'EUR',
      features: plan.features,
      maxUsers: plan.maxUsers,
    };

    // Calculer les montants
    const finalSubtotal = subtotal || amount;
    const finalDiscount = discountAmount || 0;
    const taxAmount = 0; // TODO: Calculer la TVA si nécessaire
    const totalAmount = finalSubtotal - finalDiscount + taxAmount;

    // Date d'échéance (30 jours par défaut)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice = new this.invoiceModel({
      invoiceNumber,
      tenantId,
      planId,
      planName: plan.name,
      amount: totalAmount,
      currency: plan.currency || 'EUR',
      status:
        paymentMethod === PlatformInvoicePaymentMethod.CARD
          ? PlatformInvoiceStatus.ISSUED
          : PlatformInvoiceStatus.DRAFT,
      paymentMethod,
      issuedAt: new Date(),
      dueDate,
      tenantSnapshot,
      planSnapshot,
      promoCode,
      discountAmount: finalDiscount,
      subtotal: finalSubtotal,
      taxAmount,
      totalAmount,
    });

    await invoice.save();

    // Générer le PDF immédiatement si paiement par carte
    if (paymentMethod === PlatformInvoicePaymentMethod.CARD) {
      const pdfUrl = await this.generateAndSavePDF(invoice._id.toString());

      // Envoyer l'email avec la facture
      try {
        const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        if (settings && invoice.pdfPath) {
          await this.invoiceEmailService.sendInvoiceEmail(
            invoice,
            tenant,
            settings,
            invoice.pdfPath,
          );
          invoice.emailSent = true;
          invoice.emailSentAt = new Date();
          await invoice.save();
        }
      } catch (error) {
        this.logger.error(
          `Erreur lors de l'envoi de l'email pour la facture ${invoice.invoiceNumber}:`,
          error,
        );
      }
    }

    return invoice;
  }

  /**
   * Génère et sauvegarde le PDF de la facture
   */
  async generateAndSavePDF(invoiceId: string): Promise<string> {
    const invoice = await this.invoiceModel.findById(invoiceId).exec();
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const tenant = await this.tenantModel.findById(invoice.tenantId).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
    if (!settings) {
      throw new NotFoundException('Platform settings not found');
    }

    // Si le PDF existe déjà, retourner l'URL
    if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
      return invoice.pdfUrl || invoice.pdfPath;
    }

    // Générer le PDF
    const pdfBuffer = await this.invoiceGenerator.generateInvoicePDF(invoice, settings, tenant);

    // Créer le dossier invoices s'il n'existe pas
    const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    // Sauvegarder le fichier
    const fileName = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);

    // Mettre à jour l'invoice avec le chemin et l'URL
    invoice.pdfPath = filePath;
    invoice.pdfUrl = `/uploads/invoices/${fileName}`;
    await invoice.save();

    this.logger.log(`PDF généré pour la facture ${invoice.invoiceNumber}: ${filePath}`);

    return invoice.pdfUrl;
  }

  /**
   * Récupère toutes les factures d'un tenant
   */
  async findByTenant(tenantId: string): Promise<PlatformInvoiceDocument[]> {
    return this.invoiceModel.find({ tenantId }).sort({ issuedAt: -1 }).exec();
  }

  /**
   * Récupère une facture par ID
   */
  async findOne(id: string, tenantId?: string): Promise<PlatformInvoiceDocument> {
    const query: any = { _id: id };
    if (tenantId) {
      query.tenantId = tenantId;
    }

    const invoice = await this.invoiceModel.findOne(query).exec();
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  /**
   * Marque une facture comme payée
   */
  async markAsPaid(invoiceId: string): Promise<PlatformInvoiceDocument> {
    const invoice = await this.invoiceModel.findById(invoiceId).exec();
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = PlatformInvoiceStatus.PAID;
    invoice.paidAt = new Date();
    await invoice.save();

    return invoice;
  }

  /**
   * Génère la facture finale pour un virement approuvé
   */
  async generateFinalInvoiceForTransfer(tenantId: string): Promise<PlatformInvoiceDocument> {
    // Trouver la dernière facture DRAFT pour ce tenant
    const draftInvoice = await this.invoiceModel
      .findOne({
        tenantId,
        status: PlatformInvoiceStatus.DRAFT,
        paymentMethod: PlatformInvoicePaymentMethod.TRANSFER,
      })
      .sort({ issuedAt: -1 })
      .exec();

    if (!draftInvoice) {
      throw new NotFoundException('No draft invoice found for this tenant');
    }

    // Générer le PDF
    await this.generateAndSavePDF(draftInvoice._id.toString());

    // Marquer comme ISSUED
    draftInvoice.status = PlatformInvoiceStatus.ISSUED;
    await draftInvoice.save();

    // Envoyer l'email avec la facture
    try {
      const tenant = await this.tenantModel.findById(tenantId).exec();
      const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();

      if (tenant && settings && draftInvoice.pdfPath) {
        await this.invoiceEmailService.sendInvoiceEmail(
          draftInvoice,
          tenant,
          settings,
          draftInvoice.pdfPath,
        );
        draftInvoice.emailSent = true;
        draftInvoice.emailSentAt = new Date();
        await draftInvoice.save();
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de l'envoi de l'email pour la facture ${draftInvoice.invoiceNumber}:`,
        error,
      );
    }

    return draftInvoice;
  }
}
