import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee, EmployeeSchema } from './schemas/employee.schema';
import { CV, CVSchema } from './schemas/cv.schema';
import { UsersModule } from '../users/users.module';
import { DocumentParserModule } from '../document-parser/document-parser.module';
import { ChatbotService } from './chatbot.service';
import { Invoice, InvoiceSchema } from '../billing/sales/schemas/invoice.schema';
import { Client, ClientSchema } from '../clients/schemas/client.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: CV.name, schema: CVSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
    UsersModule,
    DocumentParserModule,
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService, ChatbotService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
