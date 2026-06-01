import { Model } from 'mongoose';
import { BankingAggregatorService } from './banking-aggregator.service';
import { EncryptionService } from './services/encryption.service';
import { UniversalDocumentParserService } from '../document-parser/services/universal-document-parser.service';
import { TenantsService } from '../tenants/tenants.service';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { UpdateBankingConfigDto } from './dto/update-banking-config.dto';
import { LearnFormatDto } from './dto/learn-format.dto';
import { BankAccountDocument } from './schemas/bank-account.schema';
import { BankConnection, BankConnectionDocument } from './schemas/bank-connection.schema';
import { BankTransactionDocument } from './schemas/bank-transaction.schema';
export declare class BankingSettingsController {
    private readonly bankingAggregatorService;
    private readonly encryptionService;
    private readonly documentParser;
    private readonly tenantsService;
    private bankAccountModel;
    private bankConnectionModel;
    private bankTransactionModel;
    constructor(bankingAggregatorService: BankingAggregatorService, encryptionService: EncryptionService, documentParser: UniversalDocumentParserService, tenantsService: TenantsService, bankAccountModel: Model<BankAccountDocument>, bankConnectionModel: Model<BankConnectionDocument>, bankTransactionModel: Model<BankTransactionDocument>);
    generateConnectUrl(user: any, institutionId: string, provider: string): Promise<{
        url: string;
        state: string;
    }>;
    handleCallback(user: any, exchangeCodeDto: ExchangeCodeDto): Promise<BankConnectionDocument>;
    syncTransactions(user: any, connectionId: string): Promise<any[]>;
    getBankAccounts(user: any): Promise<any[]>;
    createBankAccount(user: any, body: any): Promise<{
        id: string;
        name: string;
        iban?: string;
        bic?: string;
        bankName?: string;
        accountNumber?: string;
        provider: import("./schemas/bank-account.schema").BankAccountProvider;
        externalId?: string;
        balance: number;
        currency: string;
        lastSyncAt?: Date;
        connectionId?: string;
        tenantId: string;
        isActive: boolean;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    createTransactions(user: any, body: {
        bankAccountId: string;
        transactions: Array<{
            date: string;
            label: string;
            amount: number;
            type?: 'debit' | 'credit';
            currency?: string;
        }>;
    }): Promise<{
        message: string;
        count: number;
        ids: string[];
    }>;
    getTransactions(user: any, bankAccountId: string, status?: string): Promise<{
        id: any;
        bankAccountId: any;
        date: any;
        label: any;
        amount: any;
        type: any;
        currency: any;
        status: any;
        reconciledAt: any;
        targetType: any;
        targetId: any;
    }[]>;
    getBankConnections(user: any): Promise<(import("mongoose").Document<unknown, {}, BankConnectionDocument, {}, {}> & BankConnection & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getInstitutions(user: any, country?: string): Promise<any[]>;
    getBankingConfig(user: any): Promise<{
        provider: any;
        isActive: boolean;
        redirectUri?: undefined;
        baseUrl?: undefined;
    } | {
        provider: "GOCARDLESS" | "BRIDGE";
        isActive: boolean;
        redirectUri: string;
        baseUrl: string;
    }>;
    updateBankingConfig(user: any, updateDto: UpdateBankingConfigDto): Promise<{
        message: string;
        provider: import("./dto/update-banking-config.dto").BankingProvider;
        isActive: boolean;
    }>;
    analyzeBankFile(user: any, file: any): Promise<import("../document-parser/services/universal-document-parser.service").AnalyzeFileResult>;
    learnFormat(user: any, learnFormatDto: LearnFormatDto): Promise<{
        message: string;
        template: {
            id: string;
            name: string;
            signature: string;
        };
    }>;
    getTemplates(user: any): Promise<{
        id: string;
        name: string;
        signature: string;
        fileType: "CSV" | "PDF" | "DOCX";
        createdAt: any;
    }[]>;
    deleteTemplate(user: any, templateId: string): Promise<{
        message: string;
    }>;
}
