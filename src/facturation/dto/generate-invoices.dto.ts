import { IsArray, IsInt } from 'class-validator';
export class GenerateInvoicesDto {
  @IsArray() @IsInt({ each: true })
  craLineIds: number[];
}