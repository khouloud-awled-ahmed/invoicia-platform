import { VerificationService } from './verification.service';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    getSettings(): Promise<{
        requireEmailVerification: boolean;
        requirePhoneVerification: boolean;
    }>;
    sendEmailOTP(user: any): Promise<{
        message: string;
    }>;
    sendSMSOTP(body: {
        phone: string;
    }, user: any): Promise<{
        message: string;
    }>;
    validateEmailOTP(body: {
        code: string;
    }, user: any): Promise<{
        message: string;
    }>;
    validateSMSOTP(body: {
        phone: string;
        code: string;
    }, user: any): Promise<{
        message: string;
    }>;
}
