import { IsNotEmpty, IsEmail, IsString, IsArray, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';

export class CreateTenantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsNotEmpty()
  @IsString()
  matriculeFiscal: string;

  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @IsOptional()
  @IsString()
  adminName?: string;

  @IsOptional()
  @IsString()
  adminPassword?: string;

  @IsArray()
  @IsString({ each: true })
  modules: string[];

  @IsOptional()
  @IsEnum(['ACTIVE', 'PENDING_PAYMENT', 'SUSPENDED', 'TRIAL', 'CANCELLED'])
  subscriptionStatus?: string;

  @IsOptional()
  @IsEnum(['CUSTOM', 'STARTER', 'BUSINESS', 'PREMIUM'])
  planType?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsers?: number;

  @IsOptional()
  @IsString()
  planId?: string;
}
