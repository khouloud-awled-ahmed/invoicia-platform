import { IsEnum, IsMongoId, IsString } from 'class-validator';

export enum ReconciliationTargetType {
  INVOICE = 'INVOICE',
  EXPENSE = 'EXPENSE',
  PAYROLL = 'PAYROLL',
  TAX = 'TAX',
}

export class MatchReconciliationDto {
  @IsString()
  @IsMongoId()
  bankTransactionId: string;

  @IsString()
  @IsMongoId()
  targetId: string;

  @IsEnum(ReconciliationTargetType)
  targetType: ReconciliationTargetType;
}
