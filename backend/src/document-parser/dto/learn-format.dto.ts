import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class ParserConfigDto {
  // Pour BANK
  @IsOptional()
  @IsNumber()
  startRow?: number;

  @IsOptional()
  @IsNumber()
  dateColumn?: number;

  @IsOptional()
  @IsNumber()
  labelColumn?: number;

  @IsOptional()
  @IsNumber()
  amountColumn?: number;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsBoolean()
  hasHeader?: boolean;

  @IsOptional()
  @IsString()
  delimiter?: string;

  @IsOptional()
  @IsString()
  encoding?: string;

  // Pour INVOICE
  @IsOptional()
  @IsString()
  invoiceNumberPattern?: string;

  @IsOptional()
  @IsString()
  datePattern?: string;

  @IsOptional()
  @IsString()
  totalHTPattern?: string;

  @IsOptional()
  @IsString()
  totalTVAPattern?: string;

  @IsOptional()
  @IsString()
  totalTTCPattern?: string;

  @IsOptional()
  @IsString()
  supplierPattern?: string;

  // Pour CV
  @IsOptional()
  @IsString()
  emailPattern?: string;

  @IsOptional()
  @IsString()
  phonePattern?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skillsKeywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experienceKeywords?: string[];
}

export class LearnFormatDto {
  @IsString()
  name: string;

  @IsString()
  signature: string;

  @IsEnum(['BANK', 'INVOICE', 'CV'])
  type: string;

  @ValidateNested()
  @Type(() => ParserConfigDto)
  config: ParserConfigDto;

  @IsEnum(['CSV', 'PDF', 'DOCX'])
  fileType: 'CSV' | 'PDF' | 'DOCX';
}
