import { Model } from 'mongoose';
import { UserDocument } from '../../users/schemas/user.schema';
import { PlatformSettingsDocument } from '../../platform/schemas/platform-settings.schema';
export declare class VerificationService {
    private userModel;
    private settingsModel;
    private otpStorage;
    constructor(userModel: Model<UserDocument>, settingsModel: Model<PlatformSettingsDocument>);
    sendEmailOTP(email: string): Promise<void>;
    sendSMSOTP(phone: string): Promise<void>;
    validateEmailOTP(email: string, code: string): Promise<boolean>;
    validateSMSOTP(phone: string, code: string): Promise<boolean>;
    private generateOTP;
    getVerificationSettings(): Promise<{
        requireEmailVerification: boolean;
        requirePhoneVerification: boolean;
    }>;
}
