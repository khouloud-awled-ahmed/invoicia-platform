import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UserSyncService {
  private readonly logger = new Logger(UserSyncService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Crée automatiquement un User lors de la création d'un Employee
   */
  async createUserFromEmployee(
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
    role: 'CONSULTANT' | 'MANAGER' | 'RH' = 'CONSULTANT',
  ): Promise<UserDocument> {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    if (existingUser) {
      this.logger.warn(`User already exists for email ${email}`);
      throw new BadRequestException(`Un utilisateur avec l'email ${email} existe déjà`);
    }

    // Générer un mot de passe temporaire
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Créer l'utilisateur
    const user = new this.userModel({
      name: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      tenantId,
      isActive: true,
      isEmailVerified: false,
      metadata: {
        tempPassword, // Stocker temporairement pour l'email
        createdFrom: 'EMPLOYEE',
      },
    });

    await user.save();

    this.logger.log(`User created for employee ${email} with role ${role}`);

    // TODO: Envoyer un email avec le mot de passe temporaire
    // await this.sendPasswordSetupEmail(email, tempPassword);

    return user;
  }

  /**
   * Crée automatiquement un User lors de la création d'un Intervenant externe
   */
  async createUserFromIntervenant(
    email: string,
    firstName: string,
    lastName: string,
    tenantId: string,
  ): Promise<UserDocument> {
    return this.createUserFromEmployee(email, firstName, lastName, tenantId, 'CONSULTANT');
  }

  /**
   * Met à jour le User si l'Employee est modifié
   */
  async updateUserFromEmployee(
    userId: string,
    firstName: string,
    lastName: string,
    email?: string,
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      this.logger.warn(`User with ID ${userId} not found for update`);
      return null;
    }

    user.name = `${firstName} ${lastName}`;
    if (email && email.toLowerCase() !== user.email) {
      // Vérifier que le nouvel email n'est pas déjà utilisé
      const existingUser = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new BadRequestException(`L'email ${email} est déjà utilisé par un autre utilisateur`);
      }
      user.email = email.toLowerCase();
    }

    await user.save();
    this.logger.log(`User ${userId} updated successfully`);
    return user;
  }

  /**
   * Désactive le User si l'Employee est désactivé
   */
  async deactivateUserFromEmployee(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false }).exec();
  }

  /**
   * Réactive le User si l'Employee est réactivé
   */
  async activateUserFromEmployee(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { isActive: true }).exec();
  }
}
