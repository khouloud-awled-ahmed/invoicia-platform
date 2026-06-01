import { Model } from 'mongoose';
import { TenantDocument } from '../tenants/schemas/tenant.schema';
import { SocialOrgDocument } from './schemas/social-org.schema';
import { EmployeeDocument } from '../employees/schemas/employee.schema';
export declare class DSNGeneratorService {
    private tenantModel;
    private socialOrgModel;
    private employeeModel;
    private readonly logger;
    constructor(tenantModel: Model<TenantDocument>, socialOrgModel: Model<SocialOrgDocument>, employeeModel: Model<EmployeeDocument>);
    generateMonthlyDSN(tenantId: string, month: string, year: string): Promise<string>;
    private generateBlock00;
    private generateBlock05;
    private generateBlock11;
    private generateBlock30;
    private generateBlock40;
    private generateBlock70;
    private formatDateDDMMYYYY;
    private formatTimeHHMMSS;
    private padRight;
}
