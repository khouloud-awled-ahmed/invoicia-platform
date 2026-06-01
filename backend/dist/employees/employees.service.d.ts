import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CVDocument } from './schemas/cv.schema';
import { UserSyncService } from '../users/user-sync.service';
export declare class EmployeesService {
    private employeeModel;
    private cvModel;
    private userSyncService;
    private readonly logger;
    constructor(employeeModel: Model<EmployeeDocument>, cvModel: Model<CVDocument>, userSyncService: UserSyncService);
    create(createDto: any, tenantId: string): Promise<Employee>;
    findAll(tenantId: string): Promise<Employee[]>;
    findOne(id: string, tenantId: string): Promise<Employee>;
    update(id: string, updateDto: any, tenantId: string): Promise<Employee>;
    remove(id: string, tenantId: string): Promise<void>;
    createCV(tenantId: string, data: {
        fileName: string;
        name?: string;
        email?: string;
        rawText: string;
    }): Promise<CVDocument>;
    findAllCVs(tenantId: string): Promise<CVDocument[]>;
}
