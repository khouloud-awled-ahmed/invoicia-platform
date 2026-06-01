import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { TenantDocument } from '../tenants/schemas/tenant.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private userModel;
    private tenantModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, tenantModel: Model<TenantDocument>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            roleSlug: any;
            tenantId: any;
            avatar: any;
            mfaEnabled: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
            avatar: string;
            mfaEnabled: boolean;
        };
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(email: string, token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
