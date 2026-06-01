import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { SuppliersModule } from './suppliers/suppliers.module';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { ModuleAccessGuard } from '../guards/module-access.guard';
import { DocumentParserModule } from '../../document-parser/document-parser.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    SuppliersModule,
    DocumentParserModule,
  ],
  controllers: [PurchasesController],
  providers: [PurchasesService, ModuleAccessGuard],
  exports: [PurchasesService, SuppliersModule],
})
export class PurchasesModule {}
