import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';

export enum BankingProvider {
  GOCARDLESS = 'GOCARDLESS',
  BRIDGE = 'BRIDGE',
}

export class UpdateBankingConfigDto {
  @IsEnum(BankingProvider)
  provider: BankingProvider;

  @IsString()
  clientId: string;

  @IsString()
  clientSecret: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  baseUrl?: string;
}
