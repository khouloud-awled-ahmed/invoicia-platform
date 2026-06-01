import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateFolderDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum([
    'factures',
    'depenses',
    'avoirs',
    'devis',
    'documents_fournisseurs',
    'documents_clients',
    'contrats',
    'documents_societe',
    'autre',
  ])
  documentType?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
