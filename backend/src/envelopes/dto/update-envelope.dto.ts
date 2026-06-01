import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EnvelopeStatus } from '../schemas/envelope.schema';

export class UpdateEnvelopeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(EnvelopeStatus)
  status?: EnvelopeStatus;
}
