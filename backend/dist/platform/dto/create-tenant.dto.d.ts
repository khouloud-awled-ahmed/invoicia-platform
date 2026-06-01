export declare class CreateTenantDto {
    name: string;
    businessName?: string;
    matriculeFiscal: string;
    adminEmail: string;
    adminName?: string;
    adminPassword?: string;
    modules: string[];
    subscriptionStatus?: string;
    planType?: string;
    maxUsers?: number;
    planId?: string;
}
