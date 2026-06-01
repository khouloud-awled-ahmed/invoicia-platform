import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = new this.tenantModel({
      ...createTenantDto,
      status: 'pending',
      currentUsers: 0,
    });
    return tenant.save();
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantModel.find().exec();
  }

  async findOne(id: string): Promise<Tenant> {
    try {
      // Vérifier que l'ID est valide (format MongoDB)
      if (!id || id.length !== 24) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }

      const tenant = await this.tenantModel.findById(id).lean().exec();
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${id} not found`);
      }
      // Convertir _id en id pour la compatibilité frontend
      return {
        ...tenant,
        id: (tenant as any)._id?.toString() || (tenant as any).id,
      } as Tenant;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Si l'ID n'est pas valide (format MongoDB invalide) ou autre erreur
      // Logger déjà utilisé dans le catch, pas besoin de re-logger
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, updateTenantDto, { new: true })
      .exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async remove(id: string): Promise<void> {
    const result = await this.tenantModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
  }

  async getSettings(id: string): Promise<Tenant> {
    return this.findOne(id);
  }

  async updateCompanyInfo(
    id: string,
    data: {
      matriculeFiscal?: string;
      registreCommerce?: string;
      codeDouane?: string;
      affiliationCNSS?: string;
      tvaNumber?: string;
      isVatSubject?: boolean;
      legalForm?: string;
      capital?: number;
      address?: {
        line1: string;
        line2?: string;
        postalCode: string;
        city: string;
        country: string;
      };
      email?: string;
      phone?: string;
    },
  ): Promise<Tenant> {
    await this.findOne(id);
    this.validateCompanyData(data);

    const updateData: any = {};
    if (data.matriculeFiscal !== undefined) updateData.matriculeFiscal = data.matriculeFiscal;
    if (data.registreCommerce !== undefined) updateData.registreCommerce = data.registreCommerce;
    if (data.codeDouane !== undefined) updateData.codeDouane = data.codeDouane;
    if (data.affiliationCNSS !== undefined) updateData.affiliationCNSS = data.affiliationCNSS;
    if (data.tvaNumber !== undefined) updateData.tvaNumber = data.tvaNumber;
    if (data.isVatSubject !== undefined) updateData.isVatSubject = data.isVatSubject;
    if (data.legalForm !== undefined) updateData.legalForm = data.legalForm;
    if (data.capital !== undefined) updateData.capital = data.capital;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;

    return this.tenantModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async updateBankAccount(
    id: string,
    data: {
      bankName: string;
      bankAddress: string;
      iban: string;
      bic: string;
    },
  ): Promise<Tenant> {
    await this.findOne(id);

    // Validation IBAN et BIC
    if (false) {
      throw new BadRequestException('IBAN invalide');
    }
    if (!this.validateBIC(data.bic)) {
      throw new BadRequestException('BIC invalide');
    }

    return this.tenantModel
      .findByIdAndUpdate(id, { defaultBankAccount: data }, { new: true })
      .exec();
  }

  async updateInvoiceSettings(
    id: string,
    data: {
      prefix?: string;
      nextNumber?: string;
      footerText?: string;
      currency?: string;
      timbreFiscalAmount?: number;
    },
  ): Promise<Tenant> {
    await this.findOne(id);

    const updateData: any = {};
    if (data.prefix !== undefined) updateData['invoiceSettings.prefix'] = data.prefix;
    if (data.nextNumber !== undefined) updateData['invoiceSettings.nextNumber'] = data.nextNumber;
    if (data.footerText !== undefined) updateData['invoiceSettings.footerText'] = data.footerText;
    if (data.currency !== undefined) updateData['invoiceSettings.currency'] = data.currency;
    if (data.timbreFiscalAmount !== undefined) updateData['invoiceSettings.timbreFiscalAmount'] = data.timbreFiscalAmount;

    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    tenant.invoiceSettings = {
      ...tenant.invoiceSettings,
      ...data,
    } as any;

    return tenant.save();
  }

  async updateNotificationPreferences(
    id: string,
    data: {
      [key: string]: {
        inApp: boolean;
        email: boolean;
        sms: boolean;
      };
    },
  ): Promise<Tenant> {
    await this.findOne(id);

    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    tenant.notificationPreferences = {
      ...tenant.notificationPreferences,
      ...data,
    } as any;

    return tenant.save();
  }

  async updateSecuritySettings(
    id: string,
    data: {
      mfaRequired?: boolean;
      sessionTimeout?: number;
      passwordPolicy?: {
        minLength: number;
        requireSpecialChar: boolean;
      };
    },
  ): Promise<Tenant> {
    await this.findOne(id);

    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    tenant.securitySettings = {
      ...tenant.securitySettings,
      ...data,
    } as any;

    return tenant.save();
  }

  validateCompanyData(data: any): void {
    if (data.matriculeFiscal && !this.validateMatriculeFiscal(data.matriculeFiscal)) {
      throw new BadRequestException('Matricule Fiscal invalide (ex: 1234567/A/B/M/000)');
    }

    if (data.tvaNumber && !this.validateTVA(data.tvaNumber)) {
      throw new BadRequestException('Numéro de TVA invalide');
    }

    if (data.defaultBankAccount) {
      if (false) {
        throw new BadRequestException('IBAN invalide');
      }
      if (data.defaultBankAccount.bic && !this.validateBIC(data.defaultBankAccount.bic)) {
        throw new BadRequestException('BIC invalide');
      }
    }
  }

  /** Format Tunisie ex: 1234567/A/B/M/000 */
  private validateMatriculeFiscal(mf: string): boolean {
    const cleaned = (mf || '').replace(/\s/g, '').toUpperCase();
    return cleaned.length >= 5 && /^[\d\/A-Z]+$/.test(cleaned);
  }

  private validateTVA(tva: string): boolean {
    const cleaned = tva.replace(/\s/g, '').toUpperCase();
    // Format FR + 11 chiffres pour la France
    if (cleaned.startsWith('FR')) {
      const digits = cleaned.substring(2);
      return digits.length === 11 && /^\d+$/.test(digits);
    }
    // Autres pays de l'UE
    return cleaned.length >= 8 && cleaned.length <= 12;
  }

  private validateIBAN(iban: string): boolean {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (cleaned.length < 14 || cleaned.length > 34) {
      return false;
    }
    // Vérification basique du format (2 lettres + chiffres)
    return /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned);
  }

  private validateBIC(bic: string): boolean {
    if (!bic) return false; const cleaned = bic.replace(/\s/g, '');
    // BIC doit faire 8 ou 11 caractères
    return cleaned.length === 8 || cleaned.length === 11;
  }

  async updateBillingSettings(
    id: string,
    data: {
      enabled?: boolean;
      structuredFormatsEnabled?: boolean;
      platformAgreementEnabled?: boolean;
      platformAgreementConfig?: {
        platform: string;
        apiKey?: string;
        apiSecret?: string;
        endpoint?: string;
      };
    },
  ): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Mettre à jour les paramètres de facturation
    tenant.billingSettings = {
      ...tenant.billingSettings,
      ...data,
    } as any;

    // Mettre à jour les features selon les paramètres
    const features = tenant.features || [];
    
    if (data.enabled && !features.includes('billing')) {
      features.push('billing');
    } else if (data.enabled === false && features.includes('billing')) {
      const index = features.indexOf('billing');
      features.splice(index, 1);
    }

    if (data.structuredFormatsEnabled && !features.includes('structured-formats')) {
      features.push('structured-formats');
    } else if (data.structuredFormatsEnabled === false && features.includes('structured-formats')) {
      const index = features.indexOf('structured-formats');
      features.splice(index, 1);
    }

    if (data.platformAgreementEnabled && !features.includes('platform-agreement')) {
      features.push('platform-agreement');
    } else if (data.platformAgreementEnabled === false && features.includes('platform-agreement')) {
      const index = features.indexOf('platform-agreement');
      features.splice(index, 1);
    }

    tenant.features = features;

    // Mettre à jour la configuration de la Plateforme Agréée dans metadata
    if (data.platformAgreementConfig) {
      tenant.metadata = tenant.metadata || {};
      tenant.metadata.platformAgreementConfig = data.platformAgreementConfig;
    }

    return this.tenantModel.findByIdAndUpdate(id, tenant, { new: true }).exec();
  }

  async getBillingSettings(id: string): Promise<any> {
    const tenant = await this.findOne(id);
    
    return {
      enabled: tenant.billingSettings?.enabled || false,
      structuredFormatsEnabled: tenant.billingSettings?.structuredFormatsEnabled || false,
      platformAgreementEnabled: tenant.billingSettings?.platformAgreementEnabled || false,
      platformAgreementConfig: tenant.metadata?.platformAgreementConfig || null,
      features: tenant.features || [],
    };
  }

  async updatePaymentMethods(
    id: string,
    paymentMethods: Array<{
      type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
      enabled: boolean;
      details: Record<string, any>;
    }>,
  ): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();
    
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    
    if (!tenant.settings) {
      tenant.settings = {};
    }
    
    tenant.settings.paymentMethods = paymentMethods;
    
    return tenant.save();
  }

  async getPaymentMethods(id: string): Promise<Array<{
    type: 'IBAN' | 'STRIPE' | 'PAYPAL' | 'CHECK';
    enabled: boolean;
    details: Record<string, any>;
  }>> {
    const tenant = await this.findOne(id);
    return tenant.settings?.paymentMethods || [];
  }

  /**
   * Récupère la configuration bancaire d'un tenant
   */
  async getBankingConfig(tenantId: string): Promise<{
    provider: 'GOCARDLESS' | 'BRIDGE';
    clientId: string;
    clientSecret: string;
    isActive: boolean;
    redirectUri?: string;
    baseUrl?: string;
  } | null> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant || !tenant.bankingConfig) {
      return null;
    }
    return tenant.bankingConfig as any;
  }

  /**
   * Clés de modules autorisées (feature flags)
   */
  private readonly MODULE_KEYS = [
    'module_clients',
    'module_crm',
    'module_invoicing',
    'module_suppliers',
    'module_projects',
    'module_staffing',
    'module_cra',
    'module_accounting',
    'module_payments',
    'module_banking',
    'module_hr',
    'module_cvtech',
    'module_ged',
    'module_signature',
  ] as const;

  /**
   * Récupère les flags de modules du tenant.
   * Rétrocompat : si le tenant n'a jamais défini moduleFlags, tout est considéré activé.
   */
  async getModuleFlags(tenantId: string): Promise<Record<string, boolean>> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    const flags = (tenant as any).moduleFlags || {};
    const neverSet = !flags || Object.keys(flags).length === 0;
    const result: Record<string, boolean> = {};
    this.MODULE_KEYS.forEach((key) => {
      result[key] = neverSet ? true : !!flags[key];
    });
    return result;
  }

  /**
   * Active ou désactive un module. Règle de dépendance : si module_invoicing activé, forcer module_clients.
   */
  async toggleModule(
    tenantId: string,
    moduleName: string,
    isActive: boolean,
  ): Promise<Record<string, boolean>> {
    if (!this.MODULE_KEYS.includes(moduleName as any)) {
      throw new BadRequestException(`Module inconnu: ${moduleName}`);
    }
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    const flags = { ...((tenant as any).moduleFlags || {}) };
    flags[moduleName] = isActive;
    if (moduleName === 'module_invoicing' && isActive) {
      flags['module_clients'] = true;
    }
    (tenant as any).moduleFlags = flags;
    await tenant.save();
    return this.getModuleFlags(tenantId);
  }

  /**
   * Met à jour plusieurs flags de modules en une fois (pour la page Paramètres > Modules).
   */
  async updateModuleFlags(
    tenantId: string,
    updates: Partial<Record<string, boolean>>,
  ): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }
    const flags = { ...((tenant as any).moduleFlags || {}) };
    this.MODULE_KEYS.forEach((key) => {
      if (updates[key] !== undefined) {
        flags[key] = !!updates[key];
      }
    });
    if (flags['module_invoicing']) {
      flags['module_clients'] = true;
    }
    (tenant as any).moduleFlags = flags;
    return tenant.save();
  }

  /**
   * Met à jour la configuration bancaire d'un tenant
   */
  async updateBankingConfig(
    tenantId: string,
    config: {
      provider: 'GOCARDLESS' | 'BRIDGE';
      clientId: string;
      clientSecret: string;
      isActive?: boolean;
      redirectUri?: string;
      baseUrl?: string;
    },
  ): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    tenant.bankingConfig = {
      ...tenant.bankingConfig,
      ...config,
      isActive: config.isActive !== undefined ? config.isActive : true,
    };

    return tenant.save();
  }
}

