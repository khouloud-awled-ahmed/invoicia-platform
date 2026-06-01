import { IsEmail, IsOptional, IsEnum, IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  @IsEnum(['PLATFORM_ADMIN', 'TENANT_ADMIN', 'USER', 'CONSULTANT', 'MANAGER', 'RH'])
  role?: string;

  @IsOptional()
  @IsString()
  roleSlug?: string;

  @IsOptional()
  tenantId?: string;

  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsBoolean()
  mfaEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}