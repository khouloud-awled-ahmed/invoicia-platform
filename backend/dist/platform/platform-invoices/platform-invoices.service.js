"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PlatformInvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformInvoicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const platform_invoice_schema_1 = require("../schemas/platform-invoice.schema");
const platform_settings_schema_1 = require("../schemas/platform-settings.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const subscription_plan_schema_1 = require("../schemas/subscription-plan.schema");
const invoice_generator_service_1 = require("../invoice-generator/invoice-generator.service");
const invoice_email_service_1 = require("../invoice-generator/invoice-email.service");
const fs = require("fs");
const path = require("path");
let PlatformInvoicesService = PlatformInvoicesService_1 = class PlatformInvoicesService {
    constructor(invoiceModel, settingsModel, tenantModel, planModel, invoiceGenerator, invoiceEmailService) {
        this.invoiceModel = invoiceModel;
        this.settingsModel = settingsModel;
        this.tenantModel = tenantModel;
        this.planModel = planModel;
        this.invoiceGenerator = invoiceGenerator;
        this.invoiceEmailService = invoiceEmailService;
        this.logger = new common_1.Logger(PlatformInvoicesService_1.name);
    }
    async generateInvoiceNumber() {
        const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        if (!settings) {
            throw new common_1.NotFoundException('Platform settings not found');
        }
        const currentYear = new Date().getFullYear();
        const prefix = settings.invoicePrefix || 'INV';
        const yearPrefix = `${prefix}-${currentYear}-`;
        if (!settings.nextInvoiceNumber || settings.nextInvoiceNumber === 0) {
            const lastInvoice = await this.invoiceModel
                .findOne({ invoiceNumber: new RegExp(`^${yearPrefix}`) })
                .sort({ invoiceNumber: -1 })
                .exec();
            if (lastInvoice) {
                const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0');
                settings.nextInvoiceNumber = lastNumber + 1;
            }
            else {
                settings.nextInvoiceNumber = 1;
            }
        }
        const invoiceNumber = `${yearPrefix}${settings.nextInvoiceNumber.toString().padStart(3, '0')}`;
        settings.nextInvoiceNumber++;
        await settings.save();
        return invoiceNumber;
    }
    async createInvoice(tenantId, planId, amount, paymentMethod, promoCode, discountAmount, subtotal) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const plan = await this.planModel.findById(planId).exec();
        if (!plan) {
            throw new common_1.NotFoundException('Subscription plan not found');
        }
        const invoiceNumber = await this.generateInvoiceNumber();
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
        const finalSubtotal = subtotal || amount;
        const finalDiscount = discountAmount || 0;
        const taxAmount = 0;
        const totalAmount = finalSubtotal - finalDiscount + taxAmount;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const invoice = new this.invoiceModel({
            invoiceNumber,
            tenantId,
            planId,
            planName: plan.name,
            amount: totalAmount,
            currency: plan.currency || 'EUR',
            status: paymentMethod === platform_invoice_schema_1.PlatformInvoicePaymentMethod.CARD
                ? platform_invoice_schema_1.PlatformInvoiceStatus.ISSUED
                : platform_invoice_schema_1.PlatformInvoiceStatus.DRAFT,
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
        if (paymentMethod === platform_invoice_schema_1.PlatformInvoicePaymentMethod.CARD) {
            const pdfUrl = await this.generateAndSavePDF(invoice._id.toString());
            try {
                const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
                if (settings && invoice.pdfPath) {
                    await this.invoiceEmailService.sendInvoiceEmail(invoice, tenant, settings, invoice.pdfPath);
                    invoice.emailSent = true;
                    invoice.emailSentAt = new Date();
                    await invoice.save();
                }
            }
            catch (error) {
                this.logger.error(`Erreur lors de l'envoi de l'email pour la facture ${invoice.invoiceNumber}:`, error);
            }
        }
        return invoice;
    }
    async generateAndSavePDF(invoiceId) {
        const invoice = await this.invoiceModel.findById(invoiceId).exec();
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        const tenant = await this.tenantModel.findById(invoice.tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
        if (!settings) {
            throw new common_1.NotFoundException('Platform settings not found');
        }
        if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
            return invoice.pdfUrl || invoice.pdfPath;
        }
        const pdfBuffer = await this.invoiceGenerator.generateInvoicePDF(invoice, settings, tenant);
        const invoicesDir = path.join(process.cwd(), 'uploads', 'invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }
        const fileName = `${invoice.invoiceNumber}.pdf`;
        const filePath = path.join(invoicesDir, fileName);
        fs.writeFileSync(filePath, pdfBuffer);
        invoice.pdfPath = filePath;
        invoice.pdfUrl = `/uploads/invoices/${fileName}`;
        await invoice.save();
        this.logger.log(`PDF généré pour la facture ${invoice.invoiceNumber}: ${filePath}`);
        return invoice.pdfUrl;
    }
    async findByTenant(tenantId) {
        return this.invoiceModel.find({ tenantId }).sort({ issuedAt: -1 }).exec();
    }
    async findOne(id, tenantId) {
        const query = { _id: id };
        if (tenantId) {
            query.tenantId = tenantId;
        }
        const invoice = await this.invoiceModel.findOne(query).exec();
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return invoice;
    }
    async markAsPaid(invoiceId) {
        const invoice = await this.invoiceModel.findById(invoiceId).exec();
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        invoice.status = platform_invoice_schema_1.PlatformInvoiceStatus.PAID;
        invoice.paidAt = new Date();
        await invoice.save();
        return invoice;
    }
    async generateFinalInvoiceForTransfer(tenantId) {
        const draftInvoice = await this.invoiceModel
            .findOne({
            tenantId,
            status: platform_invoice_schema_1.PlatformInvoiceStatus.DRAFT,
            paymentMethod: platform_invoice_schema_1.PlatformInvoicePaymentMethod.TRANSFER,
        })
            .sort({ issuedAt: -1 })
            .exec();
        if (!draftInvoice) {
            throw new common_1.NotFoundException('No draft invoice found for this tenant');
        }
        await this.generateAndSavePDF(draftInvoice._id.toString());
        draftInvoice.status = platform_invoice_schema_1.PlatformInvoiceStatus.ISSUED;
        await draftInvoice.save();
        try {
            const tenant = await this.tenantModel.findById(tenantId).exec();
            const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
            if (tenant && settings && draftInvoice.pdfPath) {
                await this.invoiceEmailService.sendInvoiceEmail(draftInvoice, tenant, settings, draftInvoice.pdfPath);
                draftInvoice.emailSent = true;
                draftInvoice.emailSentAt = new Date();
                await draftInvoice.save();
            }
        }
        catch (error) {
            this.logger.error(`Erreur lors de l'envoi de l'email pour la facture ${draftInvoice.invoiceNumber}:`, error);
        }
        return draftInvoice;
    }
};
exports.PlatformInvoicesService = PlatformInvoicesService;
exports.PlatformInvoicesService = PlatformInvoicesService = PlatformInvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(platform_invoice_schema_1.PlatformInvoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(platform_settings_schema_1.PlatformSettings.name)),
    __param(2, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(3, (0, mongoose_1.InjectModel)(subscription_plan_schema_1.SubscriptionPlan.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        invoice_generator_service_1.InvoiceGeneratorService,
        invoice_email_service_1.InvoiceEmailService])
], PlatformInvoicesService);
//# sourceMappingURL=platform-invoices.service.js.map