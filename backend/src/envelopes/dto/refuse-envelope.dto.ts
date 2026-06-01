import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RefuseEnvelopeDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  securityCode?: string;
}
