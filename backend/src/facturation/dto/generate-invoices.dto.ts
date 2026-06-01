import { IsArray, IsString } from 'class-validator';

export class GenerateInvoicesDto {
  @IsArray()
  @IsString({ each: true })
  craLineIds: string[];
}