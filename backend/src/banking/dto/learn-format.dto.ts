import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ParserConfigDto {
  @IsNumber()
  startRow: number;

  @IsNumber()
  dateColumn: number;

  @IsNumber()
  labelColumn: number;

  @IsNumber()
  amountColumn: number;

  @IsString()
  dateFormat: string;

  @IsBoolean()
  hasHeader: boolean;

  @IsOptional()
  @IsString()
  delimiter?: string;

  @IsOptional()
  @IsString()
  encoding?: string;
}

export class LearnFormatDto {
  @IsString()
  name: string;

  @IsString()
  signature: string;

  @ValidateNested()
  @Type(() => ParserConfigDto)
  config: ParserConfigDto;

  @IsEnum(['CSV', 'PDF'])
  fileType: 'CSV' | 'PDF';
}
