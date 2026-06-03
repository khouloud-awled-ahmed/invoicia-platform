import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateClassificationRuleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum([
    'facture',
    'depense',
    'avoir',
    'devis',
    'document_fournisseur',
    'document_client',
    'contrat',
    'document_societe',
  ])
  documentType: string;

  @IsNotEmpty()
  @IsString()
  targetFolderId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileExtensions?: string[];

  @IsOptional()
  @IsObject()
  conditions?: {
    entityType?: string;
    minSize?: number;
    maxSize?: number;
  };

  @IsOptional()
  @IsNumber()
  priority?: number;
}
