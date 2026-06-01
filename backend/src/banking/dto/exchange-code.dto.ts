import { IsString, IsNotEmpty } from 'class-validator';

export class ExchangeCodeDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  state: string; // Pour vérifier la sécurité de la requête
}
