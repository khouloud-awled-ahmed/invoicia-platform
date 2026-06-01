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
exports.BankingSettingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banking_aggregator_service_1 = require("./banking-aggregator.service");
const encryption_service_1 = require("./services/encryption.service");
const universal_document_parser_service_1 = require("../document-parser/services/universal-document-parser.service");
const tenants_service_1 = require("../tenants/tenants.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const exchange_code_dto_1 = require("./dto/exchange-code.dto");
const update_banking_config_dto_1 = require("./dto/update-banking-config.dto");
const learn_format_dto_1 = require("./dto/learn-format.dto");
const bank_account_schema_1 = require("./schemas/bank-account.schema");
const bank_connection_schema_1 = require("./schemas/bank-connection.schema");
const bank_transaction_schema_1 = require("./schemas/bank-transaction.schema");
let BankingSettingsController = class BankingSettingsController {
    constructor(bankingAggregatorService, encryptionService, documentParser, tenantsService, bankAccountModel, bankConnectionModel, bankTransactionModel) {
        this.bankingAggregatorService = bankingAggregatorService;
        this.encryptionService = encryptionService;
        this.documentParser = documentParser;
        this.tenantsService = tenantsService;
        this.bankAccountModel = bankAccountModel;
        this.bankConnectionModel = bankConnectionModel;
        this.bankTransactionModel = bankTransactionModel;
    }
    async generateConnectUrl(user, institutionId, provider) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (!institutionId || !provider) {
            throw new common_1.BadRequestException('institutionId and provider are required');
        }
        const dto = {
            institutionId,
            provider: provider,
        };
        return await this.bankingAggregatorService.generateConnectUrl(user.tenantId, dto);
    }
    async handleCallback(user, exchangeCodeDto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return await this.bankingAggregatorService.exchangeCodeForToken(user.tenantId, exchangeCodeDto);
    }
    async syncTransactions(user, connectionId) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return await this.bankingAggregatorService.fetchRealTransactions(connectionId);
    }
    async getBankAccounts(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        const accounts = await this.bankAccountModel.find({ tenantId: user.tenantId }).lean().exec();
        return accounts.map((a) => ({
            ...a,
            id: a._id?.toString(),
        }));
    }
    async createBankAccount(user, body) {
        if (!user.tenantId)
            throw new common_1.BadRequestException('Tenant ID is required');
        const account = new this.bankAccountModel({ name: body.accountName || body.name, iban: body.iban, bic: body.bic, bankName: body.bankName, tenantId: user.tenantId, provider: 'MANUAL', currency: body.currency, balance: body.balance });
        const saved = await account.save();
        return { ...saved.toObject(), id: saved._id?.toString() };
    }
    async createTransactions(user, body) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (!body.bankAccountId || !Array.isArray(body.transactions) || body.transactions.length === 0) {
            throw new common_1.BadRequestException('bankAccountId and non-empty transactions array are required');
        }
        const account = await this.bankAccountModel.findOne({
            _id: body.bankAccountId,
            tenantId: user.tenantId,
        }).exec();
        if (!account) {
            throw new common_1.BadRequestException('Compte bancaire introuvable');
        }
        const docs = body.transactions.map((tx) => ({
            tenantId: user.tenantId,
            bankAccountId: body.bankAccountId,
            date: new Date(tx.date),
            label: tx.label || '',
            amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
            type: tx.type || (tx.amount >= 0 ? 'credit' : 'debit'),
            currency: tx.currency || 'EUR',
            status: bank_transaction_schema_1.BankTransactionStatus.UNRECONCILED,
        }));
        const created = await this.bankTransactionModel.insertMany(docs);
        return {
            message: `${created.length} transaction(s) enregistrée(s)`,
            count: created.length,
            ids: created.map((c) => c._id.toString()),
        };
    }
    async getTransactions(user, bankAccountId, status) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        const filter = { tenantId: user.tenantId };
        if (bankAccountId) {
            filter.bankAccountId = bankAccountId;
        }
        if (status === 'UNRECONCILED' || status === 'RECONCILED') {
            filter.status = status;
        }
        const list = await this.bankTransactionModel.find(filter).sort({ date: -1 }).limit(500).lean().exec();
        return list.map((t) => ({
            id: t._id.toString(),
            bankAccountId: t.bankAccountId,
            date: t.date,
            label: t.label,
            amount: t.amount,
            type: t.type,
            currency: t.currency,
            status: t.status,
            reconciledAt: t.reconciledAt,
            targetType: t.targetType,
            targetId: t.targetId,
        }));
    }
    async getBankConnections(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return await this.bankConnectionModel.find({ tenantId: user.tenantId }).exec();
    }
    async getInstitutions(user, country = 'FR') {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        return await this.bankingAggregatorService.getInstitutions(country);
    }
    async getBankingConfig(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Accès réservé aux administrateurs');
        }
        const config = await this.tenantsService.getBankingConfig(user.tenantId);
        if (!config) {
            return { provider: null, isActive: false };
        }
        return {
            provider: config.provider,
            isActive: config.isActive,
            redirectUri: config.redirectUri,
            baseUrl: config.baseUrl,
        };
    }
    async updateBankingConfig(user, updateDto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent configurer le module bancaire');
        }
        const encryptedConfig = {
            provider: updateDto.provider,
            clientId: this.encryptionService.encrypt(updateDto.clientId),
            clientSecret: this.encryptionService.encrypt(updateDto.clientSecret),
            isActive: updateDto.isActive !== undefined ? updateDto.isActive : true,
            redirectUri: updateDto.redirectUri,
            baseUrl: updateDto.baseUrl,
        };
        await this.tenantsService.updateBankingConfig(user.tenantId, encryptedConfig);
        return {
            message: 'Configuration bancaire mise à jour avec succès',
            provider: updateDto.provider,
            isActive: encryptedConfig.isActive,
        };
    }
    async analyzeBankFile(user, file) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        if (!file) {
            throw new common_1.BadRequestException('Fichier requis');
        }
        return await this.documentParser.analyze(file, 'BANK', user.tenantId);
    }
    async learnFormat(user, learnFormatDto) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        const template = await this.documentParser.learnFormat(user.tenantId, {
            ...learnFormatDto,
            type: 'BANK',
        });
        return {
            message: 'Format appris avec succès',
            template: {
                id: template._id.toString(),
                name: template.name,
                signature: template.signature,
            },
        };
    }
    async getTemplates(user) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        const templates = await this.documentParser.getTemplates(user.tenantId, 'BANK');
        return templates.map(t => ({
            id: t._id.toString(),
            name: t.name,
            signature: t.signature,
            fileType: t.fileType,
            createdAt: t.createdAt || new Date(),
        }));
    }
    async deleteTemplate(user, templateId) {
        if (!user.tenantId) {
            throw new common_1.BadRequestException('Tenant ID is required');
        }
        await this.documentParser.deleteTemplate(templateId, user.tenantId);
        return { message: 'Template supprimé avec succès' };
    }
};
exports.BankingSettingsController = BankingSettingsController;
__decorate([
    (0, common_1.Get)('connect-url'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('institutionId')),
    __param(2, (0, common_1.Query)('provider')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "generateConnectUrl", null);
__decorate([
    (0, common_1.Post)('callback'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, exchange_code_dto_1.ExchangeCodeDto]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "handleCallback", null);
__decorate([
    (0, common_1.Get)('connections/:connectionId/sync'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "syncTransactions", null);
__decorate([
    (0, common_1.Get)('accounts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getBankAccounts", null);
__decorate([
    (0, common_1.Post)('accounts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "createBankAccount", null);
__decorate([
    (0, common_1.Post)('transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "createTransactions", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('bankAccountId')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('connections'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getBankConnections", null);
__decorate([
    (0, common_1.Get)('institutions'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('country')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getInstitutions", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getBankingConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_banking_config_dto_1.UpdateBankingConfigDto]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "updateBankingConfig", null);
__decorate([
    (0, common_1.Post)('import/analyze'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "analyzeBankFile", null);
__decorate([
    (0, common_1.Post)('import/learn'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, learn_format_dto_1.LearnFormatDto]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "learnFormat", null);
__decorate([
    (0, common_1.Get)('import/templates'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Delete)('import/templates/:id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], BankingSettingsController.prototype, "deleteTemplate", null);
exports.BankingSettingsController = BankingSettingsController = __decorate([
    (0, common_1.Controller)('banking'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(4, (0, mongoose_1.InjectModel)(bank_account_schema_1.BankAccount.name)),
    __param(5, (0, mongoose_1.InjectModel)(bank_connection_schema_1.BankConnection.name)),
    __param(6, (0, mongoose_1.InjectModel)(bank_transaction_schema_1.BankTransaction.name)),
    __metadata("design:paramtypes", [banking_aggregator_service_1.BankingAggregatorService,
        encryption_service_1.EncryptionService,
        universal_document_parser_service_1.UniversalDocumentParserService,
        tenants_service_1.TenantsService,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], BankingSettingsController);
//# sourceMappingURL=banking-settings.controller.js.map