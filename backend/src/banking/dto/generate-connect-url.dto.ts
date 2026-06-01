import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { BankingProvider } from '../schemas/bank-connection.schema';

export class GenerateConnectUrlDto {
  @IsNotEmpty()
  @IsString()
  institutionId: string;

  @IsNotEmpty()
  @IsEnum(BankingProvider)
  provider: BankingProvider;
}
