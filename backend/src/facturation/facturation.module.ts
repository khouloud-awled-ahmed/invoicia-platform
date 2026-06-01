import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FacturationController } from './facturation.controller';
import { FacturationService } from './facturation.service';
import { Cra, CraSchema } from './schemas/cra.schema';
import { Invoice, InvoiceSchema } from '../billing/sales/schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cra.name, schema: CraSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  controllers: [FacturationController],
  providers: [FacturationService],
})
export class FacturationModule {}
