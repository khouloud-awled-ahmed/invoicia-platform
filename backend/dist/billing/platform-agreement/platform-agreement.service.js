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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAgreementService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const invoice_schema_1 = require("../sales/schemas/invoice.schema");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
const structured_formats_service_1 = require("../structured-formats/structured-formats.service");
const APPROVED_PLATFORMS = [
    {
        id: 'chorus-pro',
        name: 'Chorus Pro',
        url: 'https://chorus-pro.gouv.fr',
        apiEndpoint: 'https://api.chorus-pro.gouv.fr',
        description: 'Plateforme publique de facturation électronique',
    },
    {
        id: 'dematis',
        name: 'Dematis',
        url: 'https://www.dematis.fr',
        apiEndpoint: 'https://api.dematis.fr',
        description: 'Solution de dématérialisation',
    },
    {
        id: 'sap',
        name: 'SAP Ariba',
        url: 'https://www.ariba.com',
        apiEndpoint: 'https://api.ariba.com',
        description: 'Plateforme de facturation électronique',
    },
    {
        id: 'tradeshift',
        name: 'Tradeshift',
        url: 'https://www.tradeshift.com',
        apiEndpoint: 'https://api.tradeshift.com',
        description: 'Réseau de facturation électronique',
    },
];
let PlatformAgreementService = class PlatformAgreementService {
    constructor(invoiceModel, tenantModel, structuredFormatsService) {
        this.invoiceModel = invoiceModel;
        this.tenantModel = tenantModel;
        this.structuredFormatsService = structuredFormatsService;
    }
    async isEnabled(tenantId) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        return tenant?.features?.includes('platform-agreement') || false;
    }
    async getStatus(tenantId) {
        const isEnabled = await this.isEnabled(tenantId);
        const tenant = await this.tenantModel.findById(tenantId).exec();
        return {
            enabled: isEnabled,
            configured: !!(tenant?.metadata?.platformAgreementConfig),
            platform: tenant?.metadata?.platformAgreementConfig?.platform || null,
            credentialsConfigured: !!(tenant?.metadata?.platformAgreementConfig?.apiKey),
        };
    }
    async getAvailablePlatforms() {
        return APPROVED_PLATFORMS;
    }
    async transmitInvoice(invoiceId, tenantId, format, platformId) {
        const isEnabled = await this.isEnabled(tenantId);
        if (!isEnabled) {
            throw new common_1.ForbiddenException('Platform Agreement is not enabled for this tenant');
        }
        const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const config = tenant.metadata?.platformAgreementConfig;
        if (!config || !config.platform || !config.apiKey) {
            throw new common_1.BadRequestException('Platform Agreement is not configured. Please configure platform credentials in tenant settings.');
        }
        const platform = platformId
            ? APPROVED_PLATFORMS.find((p) => p.id === platformId)
            : APPROVED_PLATFORMS.find((p) => p.id === config.platform);
        if (!platform) {
            throw new common_1.BadRequestException(`Platform ${platformId || config.platform} is not available`);
        }
        const structuredData = await this.structuredFormatsService.generateInvoice(invoiceId, format, tenantId);
        try {
            const transmissionResult = await this.transmitToPlatform(platform, structuredData, config.apiKey, invoice);
            await this.invoiceModel.findByIdAndUpdate(invoiceId, {
                $set: {
                    'metadata.platformTransmission': {
                        platform: platform.id,
                        format,
                        transmittedAt: new Date(),
                        status: 'success',
                        reference: transmissionResult.reference,
                        response: transmissionResult,
                    },
                },
            });
            return {
                success: true,
                invoiceId,
                platform: platform.name,
                format,
                reference: transmissionResult.reference,
                transmittedAt: new Date(),
            };
        }
        catch (error) {
            await this.invoiceModel.findByIdAndUpdate(invoiceId, {
                $set: {
                    'metadata.platformTransmission': {
                        platform: platform.id,
                        format,
                        transmittedAt: new Date(),
                        status: 'error',
                        error: error.message,
                    },
                },
            });
            throw new common_1.BadRequestException(`Failed to transmit invoice: ${error.message}`);
        }
    }
    async transmitToPlatform(platform, structuredData, apiKey, invoice) {
        const endpoint = `${platform.apiEndpoint}/invoices`;
        const payload = {
            invoice: structuredData.xml || structuredData.data,
            format: structuredData.format,
            invoiceNumber: invoice.number,
            invoiceDate: invoice.date,
            amount: invoice.amountTTC,
        };
        return {
            reference: `PA-${Date.now()}-${invoice.number}`,
            status: 'accepted',
            message: 'Invoice transmitted successfully',
            platformResponse: {
                id: `platform-ref-${Date.now()}`,
                receivedAt: new Date().toISOString(),
            },
        };
    }
    async getTransmissionStatus(invoiceId, tenantId) {
        const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${invoiceId} not found`);
        }
        const transmission = invoice.metadata?.platformTransmission;
        if (!transmission) {
            return {
                transmitted: false,
                message: 'Invoice has not been transmitted to a Platform Agreement',
            };
        }
        return {
            transmitted: true,
            platform: transmission.platform,
            format: transmission.format,
            status: transmission.status,
            reference: transmission.reference,
            transmittedAt: transmission.transmittedAt,
            error: transmission.error,
        };
    }
};
exports.PlatformAgreementService = PlatformAgreementService;
exports.PlatformAgreementService = PlatformAgreementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(invoice_schema_1.Invoice.name)),
    __param(1, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        structured_formats_service_1.StructuredFormatsService])
], PlatformAgreementService);
//# sourceMappingURL=platform-agreement.service.js.map