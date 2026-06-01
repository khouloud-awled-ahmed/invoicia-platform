import { PlatformService } from './platform.service';
import { SubscriptionPlansService } from './subscription-plans.service';
import { PlatformSettingsService } from './platform-settings.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantModulesDto } from './dto/update-tenant-modules.dto';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { PlatformInvoicesService } from './platform-invoices/platform-invoices.service';
export declare class PlatformController {
    private readonly platformService;
    private readonly subscriptionPlansService;
    private readonly platformSettingsService;
    private readonly platformInvoicesService;
    constructor(platformService: PlatformService, subscriptionPlansService: SubscriptionPlansService, platformSettingsService: PlatformSettingsService, platformInvoicesService: PlatformInvoicesService);
    findAll(user: any): Promise<{
        id: any;
        name: string;
        businessName: string;
        email: string;
        adminEmail: string;
        modules: string[];
        subscriptionStatus: string;
        planType: string;
        status: string;
        currentUsers: number;
        maxUsers: number;
        createdAt: any;
        updatedAt: any;
    }[]>;
    findOne(id: string, user: any): Promise<{
        name: string;
        businessName: string;
        logo?: string;
        primaryColor: string;
        matriculeFiscal: string;
        registreCommerce?: string;
        codeDouane?: string;
        affiliationCNSS?: string;
        email: string;
        phone?: string;
        tvaNumber?: string;
        isVatSubject?: boolean;
        legalForm?: string;
        capital?: number;
        address?: import("mongoose").FlattenMaps<{
            line1: string;
            line2?: string;
            postalCode: string;
            city: string;
            country: string;
        }>;
        defaultBankAccount?: import("mongoose").FlattenMaps<{
            bankName: string;
            bankAddress: string;
            iban: string;
            bic: string;
        }>;
        defaultTerms?: import("mongoose").FlattenMaps<{
            penaltyRate: number;
            penaltyDescription: string;
            recoveryFee: number;
            discountPolicy: string;
            paymentTermsDefault: number;
        }>;
        isConfigured?: boolean;
        invoiceSettings?: import("mongoose").FlattenMaps<{
            prefix?: string;
            nextNumber?: string;
            footerText?: string;
            template?: string;
            facturXGeneration?: boolean;
            eInvoicingTransmission?: boolean;
            currency?: string;
            timbreFiscalAmount?: number;
        }>;
        billingSettings?: import("mongoose").FlattenMaps<{
            enabled: boolean;
            structuredFormatsEnabled: boolean;
            platformAgreementEnabled: boolean;
            platformAgreementConfig?: {
                platform: string;
                apiKey?: string;
                apiSecret?: string;
                endpoint?: string;
            };
        }>;
        notificationPreferences?: import("mongoose").FlattenMaps<{
            [key: string]: {
                inApp: boolean;
                email: boolean;
                sms: boolean;
            };
        }>;
        securitySettings?: import("mongoose").FlattenMaps<{
            mfaRequired: boolean;
            sessionTimeout: number;
            passwordPolicy: {
                minLength: number;
                requireSpecialChar: boolean;
            };
        }>;
        pack: string;
        modules: string[];
        moduleFlags?: import("mongoose").FlattenMaps<{
            module_clients?: boolean;
            module_crm?: boolean;
            module_invoicing?: boolean;
            module_suppliers?: boolean;
            module_projects?: boolean;
            module_staffing?: boolean;
            module_cra?: boolean;
            module_accounting?: boolean;
            module_payments?: boolean;
            module_banking?: boolean;
            module_hr?: boolean;
            module_cvtech?: boolean;
            module_ged?: boolean;
            module_signature?: boolean;
        }>;
        subscriptionStatus: string;
        planType: string;
        planId?: string;
        maxUsers: number;
        currentUsers: number;
        status: string;
        features: string[];
        trialEndsAt?: Date;
        subscriptionEndsAt?: Date;
        metadata?: import("mongoose").FlattenMaps<{
            [key: string]: any;
            notes?: string;
            lastLogin?: Date;
        }>;
        settings?: import("mongoose").FlattenMaps<{
            companyAddress?: {
                line1: string;
                line2?: string;
                postalCode: string;
                city: string;
                country: string;
            };
            matriculeFiscal?: string;
            vatNumber?: string;
            logoUrl?: string;
            paymentMethods?: Array<{
                type: "IBAN" | "STRIPE" | "PAYPAL" | "CHECK";
                enabled: boolean;
                details: Record<string, any>;
            }>;
        }>;
        adminEmail: string;
        subscriptionPlan: string;
        payrollSettings?: import("mongoose").FlattenMaps<{
            matriculeFiscal?: string;
            affiliationCNSS?: string;
            codeDouane?: string;
        }>;
        bankingConfig?: import("mongoose").FlattenMaps<{
            provider?: "GOCARDLESS" | "BRIDGE";
            clientId?: string;
            clientSecret?: string;
            isActive?: boolean;
            redirectUri?: string;
            baseUrl?: string;
        }>;
        _id: import("mongoose").Types.ObjectId;
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<import("../tenants/schemas/tenant.schema").TenantDocument, keyof Paths> & Paths;
        $clearModifiedPaths: () => import("../tenants/schemas/tenant.schema").TenantDocument;
        $clone: () => import("../tenants/schemas/tenant.schema").TenantDocument;
        $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path?: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => import("../tenants/schemas/tenant.schema").TenantDocument;
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => import("../tenants/schemas/tenant.schema").TenantDocument;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../tenants/schemas/tenant.schema").TenantDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("../tenants/schemas/tenant.schema").TenantDocument;
            (value: string | Record<string, any>): import("../tenants/schemas/tenant.schema").TenantDocument;
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").FlattenMaps<import("mongoose").Collection<import("bson").Document>>;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => any;
        depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<import("../tenants/schemas/tenant.schema").TenantDocument, Paths>;
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<import("../tenants/schemas/tenant.schema").TenantDocument>;
        id: any;
        increment: () => import("../tenants/schemas/tenant.schema").TenantDocument;
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => import("../tenants/schemas/tenant.schema").TenantDocument;
        invalidate: {
            <T extends string | number | symbol>(path: T, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
            (path: string, errorMsg: string | NativeError, value?: any, kind?: string): NativeError | null;
        };
        isDirectModified: {
            <T extends string | number | symbol>(path: T | T[]): boolean;
            (path: string | Array<string>): boolean;
        };
        isDirectSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isInit: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        isModified: {
            <T extends string | number | symbol>(path?: T | T[], options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
            (path?: string | Array<string>, options?: {
                ignoreAtomics?: boolean;
            } | null): boolean;
        };
        isNew: boolean;
        isSelected: {
            <T extends string | number | symbol>(path: T): boolean;
            (path: string): boolean;
        };
        markModified: {
            <T extends string | number | symbol>(path: T, scope?: any): void;
            (path: string, scope?: any): void;
        };
        model: {
            <ModelType = import("mongoose").Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = import("mongoose").Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => import("../tenants/schemas/tenant.schema").TenantDocument;
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<import("../tenants/schemas/tenant.schema").TenantDocument, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: import("mongoose").Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<import("../tenants/schemas/tenant.schema").TenantDocument, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("../tenants/schemas/tenant.schema").TenantDocument, {}, unknown, "find", Record<string, never>>;
        save: (options?: import("mongoose").SaveOptions) => Promise<import("../tenants/schemas/tenant.schema").TenantDocument>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<{
            [x: number]: unknown;
            [x: symbol]: unknown;
            [x: string]: unknown;
        }> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }>>;
        set: {
            <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../tenants/schemas/tenant.schema").TenantDocument;
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): import("../tenants/schemas/tenant.schema").TenantDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): import("../tenants/schemas/tenant.schema").TenantDocument;
            (value: string | Record<string, any>): import("../tenants/schemas/tenant.schema").TenantDocument;
        };
        toJSON: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<{
                [x: string]: any;
            }, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): {
                [x: string]: any;
                [x: number]: any;
                [x: symbol]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<any>;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): {
                [x: string]: any;
            };
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): any;
            <T = any>(options?: import("mongoose").ToObjectOptions & {
                flattenMaps?: true;
                flattenObjectIds?: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: false;
            }): import("mongoose").FlattenMaps<T>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<import("mongoose").FlattenMaps<T>>;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
            }): T;
            <T = any>(options: import("mongoose").ToObjectOptions & {
                flattenMaps: false;
                flattenObjectIds: true;
            }): import("mongoose").ObjectIdToString<T>;
        };
        toObject: {
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
                flattenObjectIds: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                flattenObjectIds: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
                virtuals: true;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                virtuals: true;
            }): any;
            (options: import("mongoose").ToObjectOptions & {
                versionKey: false;
            }): Omit<any, "__v">;
            (options: import("mongoose").ToObjectOptions & {
                flattenObjectIds: true;
            }): any;
            (options?: import("mongoose").ToObjectOptions): any;
            <T>(options?: import("mongoose").ToObjectOptions): import("mongoose").Require_id<T> & {
                __v: number;
            };
        };
        unmarkModified: {
            <T extends string | number | symbol>(path: T): void;
            (path: string): void;
        };
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<import("../tenants/schemas/tenant.schema").TenantDocument>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, import("../tenants/schemas/tenant.schema").TenantDocument, {}, unknown, "find", Record<string, never>>;
        validate: {
            <T extends string | number | symbol>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): Promise<void>;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): Promise<void>;
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
            }): Promise<void>;
        };
        validateSync: {
            (options: {
                pathsToSkip?: import("mongoose").pathsToSkip;
                [k: string]: any;
            }): import("mongoose").Error.ValidationError | null;
            <T extends string | number | symbol>(pathsToValidate?: T | T[], options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
            (pathsToValidate?: import("mongoose").pathsToValidate, options?: import("mongoose").AnyObject): import("mongoose").Error.ValidationError | null;
        };
        __v: number;
    }>;
    create(createTenantDto: CreateTenantDto, user: any): Promise<{
        id: string;
        name: string;
        businessName: string;
        email: string;
        adminEmail: string;
        modules: string[];
        subscriptionStatus: string;
        planType: string;
        adminUser: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    updateModules(id: string, updateModulesDto: UpdateTenantModulesDto, user: any): Promise<{
        id: string;
        modules: string[];
    }>;
    updateStatus(id: string, body: {
        subscriptionStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
    }, user: any): Promise<{
        id: string;
        subscriptionStatus: string;
        status: string;
    }>;
    updateTenant(id: string, body: {
        name?: string;
        email?: string;
        adminEmail?: string;
        planId?: string;
        subscriptionStatus?: string;
    }, user: any): Promise<{
        id: string;
        name: string;
        email: string;
        adminEmail: string;
        planId: string;
        subscriptionStatus: string;
        status: string;
    }>;
    getPlans(user: any): Promise<import("./schemas/subscription-plan.schema").SubscriptionPlan[]>;
    getPlan(id: string, user: any): Promise<import("./schemas/subscription-plan.schema").SubscriptionPlan>;
    createPlan(createPlanDto: CreateSubscriptionPlanDto, user: any): Promise<import("./schemas/subscription-plan.schema").SubscriptionPlan>;
    updatePlan(id: string, updatePlanDto: UpdateSubscriptionPlanDto, user: any): Promise<import("./schemas/subscription-plan.schema").SubscriptionPlan>;
    deletePlan(id: string, user: any): Promise<void>;
    getSettings(user: any): Promise<import("./schemas/platform-settings.schema").PlatformSettings>;
    updateSettings(updateDto: UpdatePlatformSettingsDto, user: any): Promise<import("./schemas/platform-settings.schema").PlatformSettings>;
    approveTransfer(id: string, user: any): Promise<{
        success: boolean;
        tenant: {
            id: string;
            subscriptionStatus: string;
            status: string;
        };
        invoice: {
            id: string;
            invoiceNumber: string;
            pdfUrl: string;
            status: import("./schemas/platform-invoice.schema").PlatformInvoiceStatus;
            emailSent: boolean;
        };
        message: string;
    }>;
}
