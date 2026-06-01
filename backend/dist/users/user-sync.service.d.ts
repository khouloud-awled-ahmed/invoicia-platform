import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UserSyncService {
    private userModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>);
    createUserFromEmployee(email: string, firstName: string, lastName: string, tenantId: string, role?: 'CONSULTANT' | 'MANAGER' | 'RH'): Promise<UserDocument>;
    createUserFromIntervenant(email: string, firstName: string, lastName: string, tenantId: string): Promise<UserDocument>;
    updateUserFromEmployee(userId: string, firstName: string, lastName: string, email?: string): Promise<UserDocument | null>;
    deactivateUserFromEmployee(userId: string): Promise<void>;
    activateUserFromEmployee(userId: string): Promise<void>;
}
