import { IsString, IsOptional, IsArray, ValidateNested, IsEmail, IsDateString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipientRole } from '../schemas/envelope.schema';

export class CreateRecipientDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(RecipientRole)
  role: RecipientRole;

  @IsOptional()
  @IsString()
  securityCode?: string;
}

export class CreateDocumentDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  mimeType?: string;

  @Min(1)
  order: number;
}

export class CreateEnvelopeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentDto)
  documents: CreateDocumentDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecipientDto)
  recipients: CreateRecipientDto[];
}
