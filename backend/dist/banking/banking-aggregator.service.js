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
var BankingAggregatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingAggregatorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const bank_connection_schema_1 = require("./schemas/bank-connection.schema");
const bank_account_schema_1 = require("./schemas/bank-account.schema");
const tenants_service_1 = require("../tenants/tenants.service");
const encryption_service_1 = require("./services/encryption.service");
let BankingAggregatorService = BankingAggregatorService_1 = class BankingAggregatorService {
    constructor(bankConnectionModel, bankAccountModel, configService, tenantsService, encryptionService) {
        this.bankConnectionModel = bankConnectionModel;
        this.bankAccountModel = bankAccountModel;
        this.configService = configService;
        this.tenantsService = tenantsService;
        this.encryptionService = encryptionService;
        this.logger = new common_1.Logger(BankingAggregatorService_1.name);
    }
    async isBankingServiceActive(tenantId, provider) {
        const envClientId = this.configService.get(`${provider}_CLIENT_ID`) ||
            this.configService.get(`${provider}_SECRET_ID`);
        const envClientSecret = this.configService.get(`${provider}_CLIENT_SECRET`) ||
            this.configService.get(`${provider}_SECRET_KEY`);
        if (envClientId && envClientSecret) {
            return true;
        }
        if (!tenantId) {
            return false;
        }
        const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
        return bankingConfig?.isActive === true && bankingConfig?.provider === provider;
    }
    async getBankingConfig(tenantId, provider) {
        const envClientId = this.configService.get(`${provider}_CLIENT_ID`) ||
            this.configService.get(`${provider}_SECRET_ID`);
        const envClientSecret = this.configService.get(`${provider}_CLIENT_SECRET`) ||
            this.configService.get(`${provider}_SECRET_KEY`);
        const envBaseUrl = this.configService.get(`${provider}_BASE_URL`) ||
            this.configService.get(`${provider}_API_URL`);
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3002';
        if (envClientId && envClientSecret) {
            return {
                clientId: envClientId,
                clientSecret: envClientSecret,
                redirectUri: `${frontendUrl}/banking/callback`,
                baseUrl: envBaseUrl,
            };
        }
        if (!tenantId) {
            throw new common_1.BadRequestException('Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.');
        }
        const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
        if (!bankingConfig || !bankingConfig.isActive || bankingConfig.provider !== provider) {
            throw new common_1.BadRequestException('Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.');
        }
        return {
            clientId: this.encryptionService.decrypt(bankingConfig.clientId),
            clientSecret: this.encryptionService.decrypt(bankingConfig.clientSecret),
            redirectUri: bankingConfig.redirectUri || `${frontendUrl}/banking/callback`,
            baseUrl: bankingConfig.baseUrl,
        };
    }
    async getInstitutions(country = 'FR') {
        const envClientId = this.configService.get('GOCARDLESS_CLIENT_ID') ||
            this.configService.get('GOCARDLESS_SECRET_ID');
        const envClientSecret = this.configService.get('GOCARDLESS_CLIENT_SECRET') ||
            this.configService.get('GOCARDLESS_SECRET_KEY');
        const envBaseUrl = this.configService.get('GOCARDLESS_BASE_URL') ||
            this.configService.get('GOCARDLESS_API_URL') ||
            'https://bankaccountdata.gocardless.com';
        if (!envClientId || !envClientSecret) {
            throw new common_1.BadRequestException('Le module bancaire n\'est pas configuré (clés API manquantes dans .env)');
        }
        let apiUrl = `${envBaseUrl}/api/v2/institutions/?country=${country}`;
        if (envBaseUrl.includes('/api/v2')) {
            apiUrl = `${envBaseUrl}/institutions/?country=${country}`;
        }
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${envClientId}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            this.logger.error(`Erreur GoCardless institutions (${response.status}): ${errorText}`);
            throw new common_1.BadRequestException('Erreur lors de la récupération des banques depuis GoCardless');
        }
        const data = await response.json();
        const institutions = data.results || data.institutions || data || [];
        return institutions.map((institution) => ({
            id: institution.id,
            name: institution.name,
            logo: institution.logo || institution.logo_url || institution.logoUrl,
            bic: institution.bic,
            supportedFeatures: institution.supported_features || institution.supportedFeatures || [],
            country: institution.country || country,
        }));
    }
    async generateConnectUrl(tenantId, dto) {
        const { institutionId, provider } = dto;
        const isActive = await this.isBankingServiceActive(tenantId, provider);
        if (!isActive) {
            throw new common_1.BadRequestException('Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.');
        }
        const config = await this.getBankingConfig(tenantId, provider);
        const state = `${tenantId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        let connectUrl;
        switch (provider) {
            case bank_connection_schema_1.BankingProvider.GOCARDLESS:
                connectUrl = await this.generateGoCardlessUrl(tenantId, institutionId, state, config);
                break;
            case bank_connection_schema_1.BankingProvider.BRIDGE:
                connectUrl = await this.generateBridgeUrl(tenantId, institutionId, state, config);
                break;
            default:
                throw new common_1.BadRequestException(`Provider ${provider} non supporté`);
        }
        return {
            url: connectUrl,
            state,
        };
    }
    async exchangeCodeForToken(tenantId, dto) {
        const { code, state } = dto;
        if (!state.startsWith(tenantId)) {
            throw new common_1.BadRequestException('State invalide');
        }
        const tokens = await this.exchangeCodeWithProvider(code, state, tenantId);
        const connection = await this.createOrUpdateConnection(tenantId, tokens);
        await this.syncBankAccounts(connection._id.toString());
        return connection;
    }
    async fetchRealTransactions(connectionId) {
        const connection = await this.bankConnectionModel.findById(connectionId).exec();
        if (!connection) {
            throw new common_1.NotFoundException(`Connexion bancaire ${connectionId} introuvable`);
        }
        if (!connection.isActive) {
            throw new common_1.BadRequestException('La connexion bancaire n\'est plus active');
        }
        if (connection.expiresAt && connection.expiresAt < new Date()) {
            await this.refreshAccessToken(connection);
        }
        const transactions = await this.fetchTransactionsFromProvider(connection);
        connection.lastSyncAt = new Date();
        await connection.save();
        return transactions;
    }
    async syncBankAccounts(connectionId) {
        const connection = await this.bankConnectionModel.findById(connectionId).exec();
        if (!connection) {
            throw new common_1.NotFoundException(`Connexion bancaire ${connectionId} introuvable`);
        }
        const accounts = await this.fetchAccountsFromProvider(connection);
        for (const account of accounts) {
            await this.bankAccountModel.findOneAndUpdate({ externalId: account.externalId, tenantId: connection.tenantId }, {
                ...account,
                connectionId: connection._id.toString(),
                lastSyncAt: new Date(),
            }, { upsert: true, new: true }).exec();
        }
    }
    async generateGoCardlessUrl(tenantId, institutionId, state, config) {
        const clientId = config.clientId;
        const redirectUri = config.redirectUri;
        const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';
        if (!clientId) {
            throw new common_1.BadRequestException('Configuration GoCardless invalide (clientId manquant)');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'balances,details,transactions',
            institution_id: institutionId,
            state: state,
        });
        return `${baseUrl}/user_authorize?${params.toString()}`;
    }
    async generateBridgeUrl(tenantId, institutionId, state, config) {
        const clientId = config.clientId;
        const redirectUri = config.redirectUri;
        const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';
        if (!clientId) {
            throw new common_1.BadRequestException('Configuration Bridge invalide (clientId manquant)');
        }
        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            state: state,
            bank_id: institutionId,
        });
        return `${baseUrl}/connect/items/add?${params.toString()}`;
    }
    async exchangeCodeWithProvider(code, state, tenantId) {
        const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
        if (!bankingConfig || !bankingConfig.isActive) {
            throw new common_1.BadRequestException('Configuration bancaire non trouvée ou inactive');
        }
        const provider = bankingConfig.provider;
        if (provider === bank_connection_schema_1.BankingProvider.GOCARDLESS) {
            return await this.exchangeGoCardlessCode(code, tenantId);
        }
        else if (provider === bank_connection_schema_1.BankingProvider.BRIDGE) {
            return await this.exchangeBridgeCode(code, tenantId);
        }
        throw new common_1.BadRequestException('Provider non supporté');
    }
    async exchangeGoCardlessCode(code, tenantId) {
        const config = await this.getBankingConfig(tenantId, bank_connection_schema_1.BankingProvider.GOCARDLESS);
        const clientId = config.clientId;
        const clientSecret = config.clientSecret;
        const redirectUri = config.redirectUri || `${this.configService.get('FRONTEND_URL')}/banking/callback`;
        const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Configuration GoCardless incomplète');
        }
        const response = await fetch(`${baseUrl}/token/new/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code: code,
                redirect_uri: redirectUri,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            this.logger.error(`Erreur GoCardless token exchange: ${error}`);
            throw new common_1.BadRequestException('Erreur lors de l\'échange du code GoCardless');
        }
        const data = await response.json();
        return {
            accessToken: data.access,
            refreshToken: data.refresh,
            expiresAt: data.access_expires ? new Date(Date.now() + data.access_expires * 1000) : undefined,
            provider: bank_connection_schema_1.BankingProvider.GOCARDLESS,
            institutionId: data.institution_id || '',
            institutionName: data.institution_name,
        };
    }
    async exchangeBridgeCode(code, tenantId) {
        const config = await this.getBankingConfig(tenantId, bank_connection_schema_1.BankingProvider.BRIDGE);
        const clientId = config.clientId;
        const clientSecret = config.clientSecret;
        const redirectUri = config.redirectUri || `${this.configService.get('FRONTEND_URL')}/banking/callback`;
        const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';
        if (!clientId || !clientSecret) {
            throw new common_1.BadRequestException('Configuration Bridge incomplète');
        }
        const response = await fetch(`${baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': clientId,
                'Client-Secret': clientSecret,
            },
            body: JSON.stringify({
                code: code,
                redirect_uri: redirectUri,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            this.logger.error(`Erreur Bridge token exchange: ${error}`);
            throw new common_1.BadRequestException('Erreur lors de l\'échange du code Bridge');
        }
        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
            provider: bank_connection_schema_1.BankingProvider.BRIDGE,
            institutionId: data.bank_id || '',
            institutionName: data.bank_name,
        };
    }
    async createOrUpdateConnection(tenantId, tokens) {
        return await this.bankConnectionModel.findOneAndUpdate({ tenantId, institutionId: tokens.institutionId, provider: tokens.provider }, {
            tenantId,
            provider: tokens.provider,
            institutionId: tokens.institutionId,
            institutionName: tokens.institutionName,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            isActive: true,
        }, { upsert: true, new: true }).exec();
    }
    async refreshAccessToken(connection) {
        if (!connection.refreshToken) {
            throw new common_1.BadRequestException('Impossible de rafraîchir le token : refreshToken manquant');
        }
        const bankingConfig = await this.tenantsService.getBankingConfig(connection.tenantId);
        if (!bankingConfig || !bankingConfig.isActive) {
            throw new common_1.BadRequestException('Configuration bancaire non trouvée ou inactive');
        }
        let newTokens;
        if (connection.provider === bank_connection_schema_1.BankingProvider.GOCARDLESS) {
            newTokens = await this.refreshGoCardlessToken(connection.refreshToken, connection.tenantId);
        }
        else if (connection.provider === bank_connection_schema_1.BankingProvider.BRIDGE) {
            newTokens = await this.refreshBridgeToken(connection.refreshToken, connection.tenantId);
        }
        else {
            throw new common_1.BadRequestException('Provider non supporté pour le refresh');
        }
        connection.accessToken = newTokens.accessToken;
        if (newTokens.refreshToken) {
            connection.refreshToken = newTokens.refreshToken;
        }
        if (newTokens.expiresAt) {
            connection.expiresAt = newTokens.expiresAt;
        }
        await connection.save();
    }
    async refreshGoCardlessToken(refreshToken, tenantId) {
        const config = await this.getBankingConfig(tenantId, bank_connection_schema_1.BankingProvider.GOCARDLESS);
        const clientId = config.clientId;
        const clientSecret = config.clientSecret;
        const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';
        const response = await fetch(`${baseUrl}/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                refresh: refreshToken,
            }),
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Erreur lors du rafraîchissement du token GoCardless');
        }
        const data = await response.json();
        return {
            accessToken: data.access,
            refreshToken: data.refresh,
            expiresAt: data.access_expires ? new Date(Date.now() + data.access_expires * 1000) : undefined,
        };
    }
    async refreshBridgeToken(refreshToken, tenantId) {
        const config = await this.getBankingConfig(tenantId, bank_connection_schema_1.BankingProvider.BRIDGE);
        const clientId = config.clientId;
        const clientSecret = config.clientSecret;
        const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';
        const response = await fetch(`${baseUrl}/oauth/token/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': clientId,
                'Client-Secret': clientSecret,
            },
            body: JSON.stringify({
                refresh_token: refreshToken,
            }),
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Erreur lors du rafraîchissement du token Bridge');
        }
        const data = await response.json();
        return {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        };
    }
    async fetchAccountsFromProvider(connection) {
        if (connection.provider === bank_connection_schema_1.BankingProvider.GOCARDLESS) {
            return await this.fetchGoCardlessAccounts(connection);
        }
        else if (connection.provider === bank_connection_schema_1.BankingProvider.BRIDGE) {
            return await this.fetchBridgeAccounts(connection);
        }
        return [];
    }
    async fetchGoCardlessAccounts(connection) {
        const baseUrl = this.configService.get('GOCARDLESS_BASE_URL') || 'https://bankaccountdata.gocardless.com';
        const response = await fetch(`${baseUrl}/accounts/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
            },
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des comptes GoCardless');
        }
        const data = await response.json();
        return data.accounts.map((account) => ({
            name: account.name || account.iban || 'Compte bancaire',
            iban: account.iban,
            bic: account.bic,
            bankName: connection.institutionName,
            externalId: account.id,
            balance: account.balance?.amount || 0,
            currency: account.balance?.currency || 'EUR',
            provider: bank_connection_schema_1.BankingProvider.GOCARDLESS,
        }));
    }
    async fetchBridgeAccounts(connection) {
        const config = await this.getBankingConfig(connection.tenantId, bank_connection_schema_1.BankingProvider.BRIDGE);
        const clientId = config.clientId;
        const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';
        const response = await fetch(`${baseUrl}/accounts`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
                'Client-Id': clientId,
            },
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des comptes Bridge');
        }
        const data = await response.json();
        return data.resources.map((account) => ({
            name: account.name || account.iban || 'Compte bancaire',
            iban: account.iban,
            bic: account.bic,
            bankName: connection.institutionName,
            externalId: account.id,
            balance: account.balance || 0,
            currency: account.currency || 'EUR',
            provider: bank_connection_schema_1.BankingProvider.BRIDGE,
        }));
    }
    async fetchTransactionsFromProvider(connection) {
        if (connection.provider === bank_connection_schema_1.BankingProvider.GOCARDLESS) {
            return await this.fetchGoCardlessTransactions(connection);
        }
        else if (connection.provider === bank_connection_schema_1.BankingProvider.BRIDGE) {
            return await this.fetchBridgeTransactions(connection);
        }
        return [];
    }
    async fetchGoCardlessTransactions(connection) {
        const baseUrl = this.configService.get('GOCARDLESS_BASE_URL') || 'https://bankaccountdata.gocardless.com';
        const accountsResponse = await fetch(`${baseUrl}/accounts/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
            },
        });
        if (!accountsResponse.ok) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des comptes');
        }
        const accountsData = await accountsResponse.json();
        const allTransactions = [];
        for (const account of accountsData.accounts) {
            const transactionsResponse = await fetch(`${baseUrl}/accounts/${account.id}/transactions/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${connection.accessToken}`,
                },
            });
            if (transactionsResponse.ok) {
                const transactionsData = await transactionsResponse.json();
                allTransactions.push(...transactionsData.transactions);
            }
        }
        return allTransactions;
    }
    async fetchBridgeTransactions(connection) {
        const config = await this.getBankingConfig(connection.tenantId, bank_connection_schema_1.BankingProvider.BRIDGE);
        const clientId = config.clientId;
        const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';
        const response = await fetch(`${baseUrl}/transactions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${connection.accessToken}`,
                'Client-Id': clientId,
            },
        });
        if (!response.ok) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des transactions Bridge');
        }
        const data = await response.json();
        return data.resources || [];
    }
};
exports.BankingAggregatorService = BankingAggregatorService;
exports.BankingAggregatorService = BankingAggregatorService = BankingAggregatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(bank_connection_schema_1.BankConnection.name)),
    __param(1, (0, mongoose_1.InjectModel)(bank_account_schema_1.BankAccount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService,
        tenants_service_1.TenantsService,
        encryption_service_1.EncryptionService])
], BankingAggregatorService);
//# sourceMappingURL=banking-aggregator.service.js.map