import { Model } from 'mongoose';
import { TenantDocument } from '../tenants/schemas/tenant.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
export declare class PlatformService {
    private tenantModel;
    private userModel;
    constructor(tenantModel: Model<TenantDocument>, userModel: Model<UserDocument>);
    findAllTenants(): Promise<{
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
    findOneTenant(id: string): Promise<{
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
        $assertPopulated: <Paths = {}>(path: string | string[], values?: Partial<Paths>) => Omit<TenantDocument, keyof Paths> & Paths;
        $clearModifiedPaths: () => TenantDocument;
        $clone: () => TenantDocument;
        $createModifiedPathsSnapshot: () => import("mongoose").ModifiedPathsSnapshot;
        $getAllSubdocs: () => import("mongoose").Document[];
        $ignore: (path: string) => void;
        $isDefault: (path?: string) => boolean;
        $isDeleted: (val?: boolean) => boolean;
        $getPopulatedDocs: () => import("mongoose").Document[];
        $inc: (path: string | string[], val?: number) => TenantDocument;
        $isEmpty: (path: string) => boolean;
        $isValid: (path: string) => boolean;
        $locals: import("mongoose").FlattenMaps<Record<string, unknown>>;
        $markValid: (path: string) => void;
        $model: {
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        $op: "save" | "validate" | "remove" | null;
        $restoreModifiedPathsSnapshot: (snapshot: import("mongoose").ModifiedPathsSnapshot) => TenantDocument;
        $session: (session?: import("mongoose").ClientSession | null) => import("mongoose").ClientSession | null;
        $set: {
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TenantDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): TenantDocument;
            (value: string | Record<string, any>): TenantDocument;
        };
        $where: import("mongoose").FlattenMaps<Record<string, unknown>>;
        baseModelName?: string;
        collection: import("mongoose").FlattenMaps<import("mongoose").Collection<import("bson").Document>>;
        db: import("mongoose").FlattenMaps<import("mongoose").Connection>;
        deleteOne: (options?: import("mongoose").QueryOptions) => any;
        depopulate: <Paths = {}>(path?: string | string[]) => import("mongoose").MergeType<TenantDocument, Paths>;
        directModifiedPaths: () => Array<string>;
        equals: (doc: import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}>) => boolean;
        errors?: import("mongoose").Error.ValidationError;
        get: {
            <T extends string | number | symbol>(path: T, type?: any, options?: any): any;
            (path: string, type?: any, options?: any): any;
        };
        getChanges: () => import("mongoose").UpdateQuery<TenantDocument>;
        id: any;
        increment: () => TenantDocument;
        init: (obj: import("mongoose").AnyObject, opts?: import("mongoose").AnyObject) => TenantDocument;
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
            <ModelType = Model<unknown, {}, {}, {}, import("mongoose").Document<unknown, {}, unknown, {}, {}> & Required<{
                _id: unknown;
            }> & {
                __v: number;
            }, any>>(name: string): ModelType;
            <ModelType = Model<any, {}, {}, {}, any, any>>(): ModelType;
        };
        modifiedPaths: (options?: {
            includeChildren?: boolean;
        }) => Array<string>;
        overwrite: (obj: import("mongoose").AnyObject) => TenantDocument;
        $parent: () => import("mongoose").Document | undefined;
        populate: {
            <Paths = {}>(path: string | import("mongoose").PopulateOptions | (string | import("mongoose").PopulateOptions)[]): Promise<import("mongoose").MergeType<TenantDocument, Paths>>;
            <Paths = {}>(path: string, select?: string | import("mongoose").AnyObject, model?: Model<any>, match?: import("mongoose").AnyObject, options?: import("mongoose").PopulateOptions): Promise<import("mongoose").MergeType<TenantDocument, Paths>>;
        };
        populated: (path: string) => any;
        replaceOne: (replacement?: import("mongoose").AnyObject, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, TenantDocument, {}, unknown, "find", Record<string, never>>;
        save: (options?: import("mongoose").SaveOptions) => Promise<TenantDocument>;
        schema: import("mongoose").FlattenMaps<import("mongoose").Schema<any, Model<any, any, any, any, any, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, {
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
            <T extends string | number | symbol>(path: T, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TenantDocument;
            (path: string | Record<string, any>, val: any, type: any, options?: import("mongoose").DocumentSetOptions): TenantDocument;
            (path: string | Record<string, any>, val: any, options?: import("mongoose").DocumentSetOptions): TenantDocument;
            (value: string | Record<string, any>): TenantDocument;
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
        updateOne: (update?: import("mongoose").UpdateWithAggregationPipeline | import("mongoose").UpdateQuery<TenantDocument>, options?: import("mongoose").QueryOptions | null) => import("mongoose").Query<any, TenantDocument, {}, unknown, "find", Record<string, never>>;
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
    createTenant(createTenantDto: CreateTenantDto): Promise<{
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
    updateTenantModules(id: string, modules: string[]): Promise<{
        id: string;
        modules: string[];
    }>;
    updateTenantStatus(id: string, subscriptionStatus: string): Promise<{
        id: string;
        subscriptionStatus: string;
        status: string;
    }>;
    updateTenant(id: string, updateData: {
        name?: string;
        email?: string;
        adminEmail?: string;
        planId?: string;
        subscriptionStatus?: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        adminEmail: string;
        planId: string;
        subscriptionStatus: string;
        status: string;
    }>;
}
