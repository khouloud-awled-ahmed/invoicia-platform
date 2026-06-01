import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollSettingsService } from './payroll-settings.service';
import { DSNGeneratorService } from './dsn-generator.service';
import { PayrollSettingsController } from './payroll-settings.controller';
import { SocialOrg, SocialOrgSchema } from './schemas/social-org.schema';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialOrg.name, schema: SocialOrgSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [PayrollSettingsController],
  providers: [PayrollSettingsService, DSNGeneratorService],
  exports: [PayrollSettingsService, DSNGeneratorService],
})
export class PayrollSettingsModule {}
