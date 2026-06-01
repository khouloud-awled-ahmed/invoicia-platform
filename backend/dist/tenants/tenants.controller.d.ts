import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    create(createTenantDto: CreateTenantDto): Promise<import("./schemas/tenant.schema").Tenant>;
    findAll(): Promise<import("./schemas/tenant.schema").Tenant[]>;
    findOne(id: string, user: any): Promise<import("./schemas/tenant.schema").Tenant>;
    update(id: string, updateTenantDto: UpdateTenantDto, user: any): Promise<import("./schemas/tenant.schema").Tenant>;
    getModuleFlags(id: string, user: any): Promise<Record<string, boolean>>;
    updateModuleFlags(id: string, body: {
        moduleFlags: Record<string, boolean>;
    }, user: any): Promise<import("./schemas/tenant.schema").Tenant>;
    remove(id: string): Promise<void>;
    getSettings(id: string): Promise<import("./schemas/tenant.schema").Tenant>;
    updateCompanyInfo(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    updateBankAccount(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    updateInvoiceSettings(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    updateNotificationPreferences(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    updateSecuritySettings(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    updateBillingSettings(id: string, data: any): Promise<import("./schemas/tenant.schema").Tenant>;
    getBillingSettings(id: string): Promise<any>;
    updatePaymentMethods(id: string, paymentMethods: any, user: any): Promise<import("./schemas/tenant.schema").Tenant>;
    getPaymentMethods(id: string, user: any): Promise<{
        type: "IBAN" | "STRIPE" | "PAYPAL" | "CHECK";
        enabled: boolean;
        details: Record<string, any>;
    }[]>;
}
