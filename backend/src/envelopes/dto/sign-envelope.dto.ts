import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldValueDto {
  @IsString()
  fieldId: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  signatureData?: string; // Base64 encoded signature image
}

export class SignEnvelopeDto {
  @IsString()
  @IsOptional()
  securityCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueDto)
  fieldValues: FieldValueDto[];
}
