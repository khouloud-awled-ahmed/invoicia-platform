import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlatformAgreementController } from './platform-agreement.controller';
import { PlatformAgreementService } from './platform-agreement.service';
import { Invoice, InvoiceSchema } from '../sales/schemas/invoice.schema';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { StructuredFormatsModule } from '../structured-formats/structured-formats.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    StructuredFormatsModule,
  ],
  controllers: [PlatformAgreementController],
  providers: [PlatformAgreementService],
  exports: [PlatformAgreementService],
})
export class PlatformAgreementModule {}
