import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Intervenant, IntervenantDocument } from './schemas/intervenant.schema';
import { UserSyncService } from '../users/user-sync.service';

@Injectable()
export class IntervenantsService {
  private readonly logger = new Logger(IntervenantsService.name);

  constructor(
    @InjectModel(Intervenant.name) private intervenantModel: Model<IntervenantDocument>,
    private userSyncService: UserSyncService,
  ) {}

  async create(createDto: any, tenantId: string): Promise<Intervenant> {
    const intervenant = new this.intervenantModel({
      ...createDto,
      tenantId,
      email: createDto.email?.toLowerCase(),
    });

    const savedIntervenant = await intervenant.save();

    // Créer automatiquement un User associé pour les intervenants externes
    if (savedIntervenant.type === 'externe' && savedIntervenant.canSubmitCRA) {
      try {
        const user = await this.userSyncService.createUserFromIntervenant(
          savedIntervenant.email,
          savedIntervenant.firstName,
          savedIntervenant.lastName,
          tenantId,
        );

        // Lier l'Intervenant au User créé (via metadata ou nouveau champ)
        await this.intervenantModel.findByIdAndUpdate(savedIntervenant._id, {
          $set: { metadata: { ...savedIntervenant.metadata, userId: user._id.toString() } },
        }).exec();
      } catch (error) {
        this.logger.error('Erreur lors de la création automatique du User pour intervenant:', error);
        // Note: On ne fait pas échouer la création de l'intervenant si le User ne peut pas être créé
        // car l'intervenant peut exister sans compte utilisateur
      }
    }

    return savedIntervenant;
  }

  async findAll(tenantId: string, filters?: { type?: string; status?: string }): Promise<Intervenant[]> {
    const query: any = { tenantId };
    if (filters?.type) query.type = filters.type;
    if (filters?.status) query.status = filters.status;
    return this.intervenantModel.find(query).sort({ lastName: 1, firstName: 1 }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Intervenant> {
    const intervenant = await this.intervenantModel.findOne({ _id: id, tenantId }).exec();
    if (!intervenant) {
      throw new NotFoundException(`Intervenant with ID ${id} not found`);
    }
    return intervenant;
  }

  async findByEmail(email: string, tenantId: string): Promise<Intervenant | null> {
    return this.intervenantModel.findOne({ email: email.toLowerCase(), tenantId }).exec();
  }

  async update(id: string, updateDto: any, tenantId: string): Promise<Intervenant> {
    const updated = await this.intervenantModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Intervenant with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.intervenantModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Intervenant with ID ${id} not found`);
    }
  }

  // Générer un token d'accès CRA pour un intervenant externe
  async generateCRAAccessToken(id: string, tenantId: string): Promise<string> {
    const intervenant = await this.findOne(id, tenantId);
    const token = `cra_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    await this.intervenantModel.findOneAndUpdate(
      { _id: id, tenantId },
      { craAccessToken: token, canSubmitCRA: true },
      { new: true }
    ).exec();

    return token;
  }

  // Trouver un intervenant par token CRA (pour accès public)
  async findByCRAToken(token: string): Promise<Intervenant | null> {
    return this.intervenantModel.findOne({ 
      craAccessToken: token, 
      canSubmitCRA: true,
      status: 'active'
    }).exec();
  }
}
