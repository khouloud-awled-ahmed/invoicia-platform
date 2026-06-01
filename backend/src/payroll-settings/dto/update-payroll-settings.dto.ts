import { IsOptional, IsString } from 'class-validator';

export class UpdatePayrollSettingsDto {
  @IsOptional()
  @IsString()
  matriculeFiscal?: string;

  @IsOptional()
  @IsString()
  affiliationCNSS?: string;

  @IsOptional()
  @IsString()
  nic?: string;

  @IsOptional()
  @IsString()
  apeCode?: string;

  @IsOptional()
  @IsString()
  conventionCollectiveCode?: string;

  @IsOptional()
  @IsString()
  dsnSenderId?: string;
}
