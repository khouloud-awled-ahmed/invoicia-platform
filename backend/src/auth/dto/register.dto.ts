import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum, IsArray, IsString } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  companyName: string;

  @IsOptional()
  tenantId?: string;

  @IsOptional()
  @IsEnum(['PLATFORM_ADMIN', 'TENANT_ADMIN', 'USER'])
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedModules?: string[];
}

