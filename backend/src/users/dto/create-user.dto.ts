import { IsEmail, IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
  @IsOptional()
  tenantId?: string;
  @IsOptional()
  @IsEnum(['PLATFORM_ADMIN', 'TENANT_ADMIN', 'USER', 'CONSULTANT', 'MANAGER', 'RH'])
  role?: string;
  @IsOptional()
  @IsString()
  roleSlug?: string;
  @IsOptional()
  avatar?: string;
}
