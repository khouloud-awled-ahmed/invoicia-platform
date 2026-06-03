import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
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

  async register(registerDto: RegisterDto) {
    // Validation : companyName est obligatoire si tenantId n'est pas fourni
    if (!registerDto.tenantId && !registerDto.companyName) {
      throw new BadRequestException("Le nom de l'entreprise est obligatoire");
    }

    // Validation : companyName ne doit pas être vide si fourni
    if (registerDto.companyName && registerDto.companyName.trim() === '') {
      throw new BadRequestException("Le nom de l'entreprise ne peut pas être vide");
    }

    const existingUser = await this.userModel
      .findOne({ email: registerDto.email.toLowerCase() })
      .exec();
    if (existingUser) {
      throw new UnauthorizedException('Un utilisateur avec cet email existe déjà');
    }

    // Si c'est une inscription SaaS, créer le Tenant d'abord
    let tenantId = registerDto.tenantId;

    if (!tenantId && registerDto.companyName) {
      try {
        // Créer un nouveau Tenant pour cette entreprise
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
      } catch (error: any) {
        console.error('Erreur lors de la création du tenant:', error);
        throw new BadRequestException(
          "Erreur lors de la création de l'entreprise: " + (error.message || 'Erreur inconnue'),
        );
      }
    }

    if (!tenantId) {
      throw new BadRequestException('Impossible de créer le compte sans entreprise');
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

    // Mettre à jour le compteur d'utilisateurs du tenant
    if (tenantId) {
      await this.tenantModel.updateOne({ _id: tenantId }, { $inc: { currentUsers: 1 } }).exec();
    }

    const { password, ...result } = user.toObject();

    const payload = {
      email: result.email,
      sub: result._id,
      role: result.role,
      tenantId: result.tenantId,
    };
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

  /**
   * Generates a password reset token, stores ONLY a hash + expiry on the user,
   * and (for now) logs the reset URL (email sending is not implemented yet).
   *
   * Always returns a generic success message to avoid user enumeration.
   */
  async forgotPassword(email: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      user.resetPasswordTokenHash = tokenHash;
      user.resetPasswordExpiresAt = expiresAt;
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3003';
      const resetUrl = `${frontendUrl}/reset-password?email=${encodeURIComponent(normalizedEmail)}&token=${encodeURIComponent(rawToken)}`;

      // TODO: Send email via real email provider (SMTP/SendGrid/etc.)
      // For now, log it for development.
      // IMPORTANT: this logs a sensitive token; do NOT keep in production logs.
      // eslint-disable-next-line no-console
      console.log(`[PASSWORD RESET] ${normalizedEmail} -> ${resetUrl}`);
    }

    return { message: 'Si un compte existe, un email de réinitialisation a été envoyé.' };
  }

  async resetPassword(email: string, token: string, newPassword: string) {
    console.log('[RESET PASSWORD] Attempt:', {
      email,
      tokenLength: token?.length,
      newPasswordLength: newPassword?.length,
    });

    const normalizedEmail = email.toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();

    if (!user) {
      console.log('[RESET PASSWORD] User not found:', normalizedEmail);
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    if (!user.resetPasswordTokenHash || !user.resetPasswordExpiresAt) {
      console.log('[RESET PASSWORD] No reset token found for user:', normalizedEmail);
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    if (new Date() > user.resetPasswordExpiresAt) {
      console.log('[RESET PASSWORD] Token expired for user:', normalizedEmail);
      user.resetPasswordTokenHash = undefined;
      user.resetPasswordExpiresAt = undefined;
      await user.save();
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    console.log('[RESET PASSWORD] Token comparison:', {
      providedHash: tokenHash.substring(0, 10) + '...',
      storedHash: user.resetPasswordTokenHash.substring(0, 10) + '...',
      match: tokenHash === user.resetPasswordTokenHash,
    });

    if (tokenHash !== user.resetPasswordTokenHash) {
      console.log('[RESET PASSWORD] Token mismatch for user:', normalizedEmail);
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    console.log('[RESET PASSWORD] Success for user:', normalizedEmail);
    return { message: 'Mot de passe réinitialisé avec succès' };
  }
}
