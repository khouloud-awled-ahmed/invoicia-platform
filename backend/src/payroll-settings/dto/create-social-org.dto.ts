import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSocialOrgDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  contractId?: string;

  @IsOptional()
  @IsString()
  affiliationId?: string;
}
