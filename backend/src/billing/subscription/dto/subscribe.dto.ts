import { IsNotEmpty, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class SubscribeDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsEnum(['CARD', 'TRANSFER'])
  paymentMethod: 'CARD' | 'TRANSFER';

  @IsOptional()
  @IsString()
  promoCode?: string;

  @IsOptional()
  @IsObject()
  billingDetails?: {
    address?: {
      line1: string;
      line2?: string;
      postalCode: string;
      city: string;
      country: string;
    };
    vatNumber?: string;
    matriculeFiscal?: string;
  };
}
