import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from '../billing/sales/schemas/invoice.schema';
import { Expense, ExpenseSchema } from '../billing/purchases/schemas/expense.schema';
import { BankAccount, BankAccountSchema } from '../banking/schemas/bank-account.schema';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: BankAccount.name, schema: BankAccountSchema },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}