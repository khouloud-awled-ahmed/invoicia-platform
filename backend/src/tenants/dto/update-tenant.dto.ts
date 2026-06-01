import { IsOptional, IsEmail, IsEnum, IsArray, IsNumber, IsBoolean, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class DefaultBankAccountDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAddress?: string;

  @IsOptional()
  @IsString()
  iban?: string;

  @IsOptional()
  @IsString()
  bic?: string;
}

class DefaultTermsDto {
  @IsOptional()
  @IsNumber()
  penaltyRate?: number;

  @IsOptional()
  @IsString()
  penaltyDescription?: string;

  @IsOptional()
  @IsNumber()
  recoveryFee?: number;

  @IsOptional()
  @IsString()
  discountPolicy?: string;

  @IsOptional()
  @IsNumber()
  paymentTermsDefault?: number;
}

class InvoiceSettingsDto {
  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsString()
  nextNumber?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsBoolean()
  facturXGeneration?: boolean;

  @IsOptional()
  @IsBoolean()
  eInvoicingTransmission?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  timbreFiscalAmount?: number;
}

class PasswordPolicyDto {
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsBoolean()
  requireSpecialChar?: boolean;
}

class SecuritySettingsDto {
  @IsOptional()
  @IsBoolean()
  mfaRequired?: boolean;

  @IsOptional()
  @IsNumber()
  sessionTimeout?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy?: PasswordPolicyDto;
}

export class UpdateTenantDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  businessName?: string;

  @IsOptional()
  logo?: string;

  @IsOptional()
  primaryColor?: string;

  @IsOptional()
  @IsString()
  matriculeFiscal?: string;

  @IsOptional()
  @IsString()
  registreCommerce?: string;

  @IsOptional()
  @IsString()
  codeDouane?: string;

  @IsOptional()
  @IsString()
  affiliationCNSS?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsString()
  tvaNumber?: string;

  @IsOptional()
  @IsBoolean()
  isVatSubject?: boolean;

  @IsOptional()
  @IsString()
  legalForm?: string;

  @IsOptional()
  @IsNumber()
  capital?: number;

  // Adresse structurée
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  // Coordonnées bancaires par défaut
  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultBankAccountDto)
  defaultBankAccount?: DefaultBankAccountDto;

  // Conditions générales de vente
  @IsOptional()
  @ValidateNested()
  @Type(() => DefaultTermsDto)
  defaultTerms?: DefaultTermsDto;

  // Paramètres de facturation
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceSettingsDto)
  invoiceSettings?: InvoiceSettingsDto;

  // Paramètres de notifications
  @IsOptional()
  @IsObject()
  notificationPreferences?: {
    [key: string]: {
      inApp: boolean;
      email: boolean;
      sms: boolean;
    };
  };

  // Paramètres de sécurité
  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  securitySettings?: SecuritySettingsDto;

  @IsOptional()
  @IsEnum(['essential', 'business', 'premium'])
  pack?: string;

  @IsOptional()
  @IsArray()
  modules?: string[];

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsEnum(['active', 'trial', 'suspended', 'pending'])
  status?: string;

  @IsOptional()
  @IsBoolean()
  isConfigured?: boolean;
}

