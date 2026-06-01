import { IsOptional, IsString, IsObject, IsEmail } from 'class-validator';

export class UpdatePlatformSettingsDto {
  @IsOptional()
  @IsObject()
  paymentMethods?: {
    iban?: {
      iban: string;
      bic: string;
      bankName: string;
      accountHolder: string;
    };
    stripe?: {
      publicKey: string;
    };
    paypal?: {
      clientId: string;
    };
  };

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsString()
  supportPhone?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsObject()
  address?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };

  // ==========================================
  // 📄 INVOICE CONFIGURATION
  // ==========================================

  @IsOptional()
  @IsString()
  invoiceLogoUrl?: string;

  @IsOptional()
  @IsString()
  invoiceCompanyName?: string;

  @IsOptional()
  @IsObject()
  invoiceCompanyAddress?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };

  @IsOptional()
  @IsString()
  invoiceCompanyVat?: string;

  @IsOptional()
  @IsString()
  invoiceFooterText?: string;

  @IsOptional()
  @IsString()
  invoiceColor?: string;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;
}
