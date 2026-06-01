"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const user_schema_1 = require("../users/schemas/user.schema");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
let AuthService = class AuthService {
    constructor(userModel, tenantModel, jwtService) {
        this.userModel = userModel;
        this.tenantModel = tenantModel;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user.toObject();
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        await this.userModel.updateOne({ _id: user._id }, { lastLogin: new Date() });
        const payload = { email: user.email, sub: user._id, role: user.role, tenantId: user.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roleSlug: user.roleSlug,
                tenantId: user.tenantId,
                avatar: user.avatar,
                mfaEnabled: user.mfaEnabled,
            },
        };
    }
    async register(registerDto) {
        if (!registerDto.tenantId && !registerDto.companyName) {
            throw new common_1.BadRequestException('Le nom de l\'entreprise est obligatoire');
        }
        if (registerDto.companyName && registerDto.companyName.trim() === '') {
            throw new common_1.BadRequestException('Le nom de l\'entreprise ne peut pas être vide');
        }
        const existingUser = await this.userModel.findOne({ email: registerDto.email.toLowerCase() }).exec();
        if (existingUser) {
            throw new common_1.UnauthorizedException('Un utilisateur avec cet email existe déjà');
        }
        let tenantId = registerDto.tenantId;
        if (!tenantId && registerDto.companyName) {
            try {
                const tenant = new this.tenantModel({
                    name: registerDto.companyName.trim(),
                    businessName: registerDto.companyName.trim(),
                    adminEmail: registerDto.email.toLowerCase(),
                    email: registerDto.email.toLowerCase(),
                    status: 'pending',
                    subscriptionPlan: 'essential',
                    pack: 'essential',
                    modules: registerDto.selectedModules || [],
                    subscriptionStatus: 'INCOMPLETE',
                    planType: 'CUSTOM',
                    currentUsers: 0,
                    maxUsers: 10,
                    settings: {
                        paymentMethods: [],
                    },
                });
                const savedTenant = await tenant.save();
                tenantId = savedTenant._id.toString();
            }
            catch (error) {
                console.error('Erreur lors de la création du tenant:', error);
                throw new common_1.BadRequestException('Erreur lors de la création de l\'entreprise: ' + (error.message || 'Erreur inconnue'));
            }
        }
        if (!tenantId) {
            throw new common_1.BadRequestException('Impossible de créer le compte sans entreprise');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = new this.userModel({
            name: registerDto.name,
            email: registerDto.email.toLowerCase(),
            password: hashedPassword,
            role: registerDto.role || 'TENANT_ADMIN',
            tenantId: tenantId,
        });
        await user.save();
        if (tenantId) {
            await this.tenantModel.updateOne({ _id: tenantId }, { $inc: { currentUsers: 1 } }).exec();
        }
        const { password, ...result } = user.toObject();
        const payload = { email: result.email, sub: result._id, role: result.role, tenantId: result.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: result._id.toString(),
                name: result.name,
                email: result.email,
                role: result.role,
                tenantId: result.tenantId,
                avatar: result.avatar,
                mfaEnabled: result.mfaEnabled || false,
            },
        };
    }
    async forgotPassword(email) {
        const normalizedEmail = email.toLowerCase();
        const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
        if (user) {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
            user.resetPasswordTokenHash = tokenHash;
            user.resetPasswordExpiresAt = expiresAt;
            await user.save();
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
            const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(rawToken)}`;
            console.log(`[PASSWORD RESET] ${normalizedEmail} -> ${resetUrl}`);
        }
        return { message: 'Si un compte existe, un email de réinitialisation a été envoyé.' };
    }
    async resetPassword(email, token, newPassword) {
        console.log('[RESET PASSWORD] Attempt:', { email, tokenLength: token?.length, newPasswordLength: newPassword?.length });
        const normalizedEmail = email.toLowerCase();
        const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
        if (!user) {
            console.log('[RESET PASSWORD] User not found:', normalizedEmail);
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        if (!user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
            console.log('[RESET PASSWORD] No reset token found for user:', normalizedEmail);
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        if (new Date() > user.resetPasswordExpiresAt) {
            console.log('[RESET PASSWORD] Token expired for user:', normalizedEmail);
            user.resetPasswordTokenHash = undefined;
            user.resetPasswordExpiresAt = undefined;
            await user.save();
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        console.log('[RESET PASSWORD] Token comparison:', {
            providedHash: tokenHash.substring(0, 10) + '...',
            storedHash: user.resetPasswordTokenHash.substring(0, 10) + '...',
            match: tokenHash === user.resetPasswordTokenHash
        });
        if (tokenHash !== user.resetPasswordTokenHash) {
            console.log('[RESET PASSWORD] Token mismatch for user:', normalizedEmail);
            throw new common_1.BadRequestException('Lien de réinitialisation invalide ou expiré');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordTokenHash = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        console.log('[RESET PASSWORD] Success for user:', normalizedEmail);
        return { message: 'Mot de passe réinitialisé avec succès' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map