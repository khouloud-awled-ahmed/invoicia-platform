import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankTransaction, BankTransactionSchema } from '../banking/schemas/bank-transaction.schema';
import { Invoice, InvoiceSchema } from '../billing/sales/schemas/invoice.schema';
import { Expense, ExpenseSchema } from '../billing/purchases/schemas/expense.schema';
import {
  AccountingEntry,
  AccountingEntrySchema,
} from '../accounting/schemas/accounting-entry.schema';
import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankTransaction.name, schema: BankTransactionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: AccountingEntry.name, schema: AccountingEntrySchema },
    ]),
  ],
  controllers: [ReconciliationController],
  providers: [ReconciliationService],
  exports: [ReconciliationService],
})
export class ReconciliationModule {}
