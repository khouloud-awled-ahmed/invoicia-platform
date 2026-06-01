import { Model } from 'mongoose';
import { TenantDocument } from '../tenants/schemas/tenant.schema';
import { SocialOrg, SocialOrgDocument } from './schemas/social-org.schema';
import { UpdatePayrollSettingsDto } from './dto/update-payroll-settings.dto';
import { CreateSocialOrgDto } from './dto/create-social-org.dto';
export declare class PayrollSettingsService {
    private tenantModel;
    private socialOrgModel;
    private readonly logger;
    constructor(tenantModel: Model<TenantDocument>, socialOrgModel: Model<SocialOrgDocument>);
    getSettings(tenantId: string): Promise<{
        matriculeFiscal?: string;
        affiliationCNSS?: string;
        codeDouane?: string;
    }>;
    updateSettings(tenantId: string, updateDto: UpdatePayrollSettingsDto): Promise<{
        matriculeFiscal?: string;
        affiliationCNSS?: string;
        codeDouane?: string;
    }>;
    createSocialOrg(tenantId: string, createDto: CreateSocialOrgDto): Promise<SocialOrg>;
    findAllSocialOrgs(tenantId: string): Promise<SocialOrg[]>;
    findOneSocialOrg(id: string, tenantId: string): Promise<SocialOrg>;
    deleteSocialOrg(id: string, tenantId: string): Promise<void>;
}
