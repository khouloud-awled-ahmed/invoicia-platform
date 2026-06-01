import { IsArray, IsString } from 'class-validator';

export class UpdateTenantModulesDto {
  @IsArray()
  @IsString({ each: true })
  modules: string[];
}
