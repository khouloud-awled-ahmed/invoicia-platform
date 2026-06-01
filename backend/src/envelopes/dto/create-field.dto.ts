import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { FieldType } from '../schemas/envelope.schema';

export class CreateFieldDto {
  @IsEnum(FieldType)
  type: FieldType;

  @IsNumber()
  @Min(1)
  pageNumber: number;

  @IsNumber()
  @Min(0)
  xPosition: number;

  @IsNumber()
  @Min(0)
  yPosition: number;

  @IsNumber()
  @Min(1)
  width: number;

  @IsNumber()
  @Min(1)
  height: number;

  @IsString()
  assignedRecipientId: string;

  @IsString()
  linkedDocumentId: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  defaultValue?: boolean;
}
