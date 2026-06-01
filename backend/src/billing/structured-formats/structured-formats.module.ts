import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StructuredFormatsController } from './structured-formats.controller';
import { StructuredFormatsService } from './structured-formats.service';
import { UBLGeneratorService } from './generators/ubl-generator.service';
import { CIIGeneratorService } from './generators/cii-generator.service';
import { FacturXGeneratorService } from './generators/factur-x-generator.service';
import { Invoice, InvoiceSchema } from '../sales/schemas/invoice.schema';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  controllers: [StructuredFormatsController],
  providers: [
    StructuredFormatsService,
    UBLGeneratorService,
    CIIGeneratorService,
    FacturXGeneratorService,
  ],
  exports: [StructuredFormatsService],
})
export class StructuredFormatsModule {}
