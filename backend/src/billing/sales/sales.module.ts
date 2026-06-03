import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { ClientsModule } from './clients/clients.module';
import { CreditNotesModule } from './credit-notes/credit-notes.module';

// On importe les Schémas pour configurer la Base de Données
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { Client, ClientSchema } from '../../clients/schemas/client.schema';
import { Project, ProjectSchema } from '../../projects/schemas/project.schema';
import { Tenant, TenantSchema } from '../../tenants/schemas/tenant.schema';
import { ModuleAccessGuard } from '../guards/module-access.guard';
import { DocumentParserModule } from '../../document-parser/document-parser.module';

@Module({
  imports: [
    // C'est ici qu'on "active" les tables dans la base de données
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
    // Sous-modules pour Clients et Credit Notes
    ClientsModule,
    CreditNotesModule,
    DocumentParserModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, InvoicePdfService, ModuleAccessGuard],
  exports: [SalesService, ClientsModule, CreditNotesModule],
})
export class SalesModule {}
