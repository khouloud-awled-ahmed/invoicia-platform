import { Response } from 'express';
import { PayrollSettingsService } from './payroll-settings.service';
import { DSNGeneratorService } from './dsn-generator.service';
import { UpdatePayrollSettingsDto } from './dto/update-payroll-settings.dto';
import { CreateSocialOrgDto } from './dto/create-social-org.dto';
export declare class PayrollSettingsController {
    private readonly payrollSettingsService;
    private readonly dsnGeneratorService;
    constructor(payrollSettingsService: PayrollSettingsService, dsnGeneratorService: DSNGeneratorService);
    getSettings(user: any): Promise<{
        matriculeFiscal?: string;
        affiliationCNSS?: string;
        codeDouane?: string;
    }>;
    updateSettings(user: any, updateDto: UpdatePayrollSettingsDto): Promise<{
        matriculeFiscal?: string;
        affiliationCNSS?: string;
        codeDouane?: string;
    }>;
    createSocialOrg(user: any, createDto: CreateSocialOrgDto): Promise<import("./schemas/social-org.schema").SocialOrg>;
    findAllSocialOrgs(user: any): Promise<import("./schemas/social-org.schema").SocialOrg[]>;
    deleteSocialOrg(user: any, id: string): Promise<void>;
    downloadDSNTest(user: any, res: Response, month?: string, year?: string): Promise<void>;
}
