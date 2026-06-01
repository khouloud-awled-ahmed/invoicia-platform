import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BankTransaction,
  BankTransactionDocument,
  BankTransactionStatus,
} from '../banking/schemas/bank-transaction.schema';
import { Invoice, InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { Expense, ExpenseDocument } from '../billing/purchases/schemas/expense.schema';
import {
  AccountingEntry,
  AccountingEntryDocument,
} from '../accounting/schemas/accounting-entry.schema';
import { ReconciliationTargetType } from './dto/match-reconciliation.dto';

export interface OpenItemInvoice {
  id: string;
  type: 'INVOICE';
  number: string;
  date: Date;
  dueDate: Date;
  label: string;
  amount: number;
  currency?: string;
}

export interface OpenItemExpense {
  id: string;
  type: 'EXPENSE';
  date: Date;
  supplier: string;
  category: string;
  amount: number;
  currency: string;
}

export interface OpenItemPayroll {
  id: string;
  type: 'PAYROLL';
  label: string;
  amount: number;
  date?: Date;
}

export type OpenItem = OpenItemInvoice | OpenItemExpense | OpenItemPayroll;

export interface OpenItemsResponse {
  invoices: OpenItemInvoice[];
  expenses: OpenItemExpense[];
  payrolls: OpenItemPayroll[];
}

@Injectable()
export class ReconciliationService {
  constructor(
    @InjectModel(BankTransaction.name)
    private bankTransactionModel: Model<BankTransactionDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(AccountingEntry.name)
    private accountingEntryModel: Model<AccountingEntryDocument>,
  ) {}

  /**
   * Candidats au rapprochement : factures (validated/pending), dépenses (verified), paie (placeholder).
   */
  async getOpenItems(tenantId: string): Promise<OpenItemsResponse> {
    const [invoices, expenses] = await Promise.all([
      this.invoiceModel
        .find({
          tenantId,
          status: { $in: ['pending', 'validated'] },
        })
        .sort({ dueDate: 1 })
        .lean()
        .exec(),
      this.expenseModel
        .find({ tenantId, status: 'verified' })
        .sort({ date: 1 })
        .lean()
        .exec(),
    ]);

    return {
      invoices: invoices.map((inv: any) => ({
        id: inv._id.toString(),
        type: 'INVOICE' as const,
        number: inv.number,
        date: inv.date,
        dueDate: inv.dueDate,
        label: `Facture ${inv.number} - ${inv.client || ''}`,
        amount: inv.amountTTC ?? 0,
        currency: 'EUR',
      })),
      expenses: expenses.map((exp: any) => ({
        id: exp._id.toString(),
        type: 'EXPENSE' as const,
        date: exp.date,
        supplier: exp.supplier,
        category: exp.category,
        amount: exp.amountTTC ?? 0,
        currency: exp.currency ?? 'EUR',
      })),
      payrolls: [], // À brancher quand entité Paie/DSN existera
    };
  }

  /**
   * Rapproche une ligne bancaire avec un justificatif.
   * Met à jour la cible (facture → paid, dépense → exported), la transaction (RECONCILED) et crée l'écriture comptable.
   */
  async match(
    tenantId: string,
    bankTransactionId: string,
    targetId: string,
    targetType: ReconciliationTargetType,
  ): Promise<{ success: boolean; message: string }> {
    const tx = await this.bankTransactionModel.findOne({
      _id: bankTransactionId,
      tenantId,
    }).exec();
    if (!tx) {
      throw new NotFoundException('Transaction bancaire introuvable');
    }
    if (tx.status === BankTransactionStatus.RECONCILED) {
      throw new BadRequestException('Cette transaction est déjà rapprochée');
    }

    const amount = Math.abs(Number(tx.amount));
    const date = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const reference = `Rapprochement ${tx.label || tx._id}`;

    if (targetType === ReconciliationTargetType.INVOICE) {
      const invoice = await this.invoiceModel.findOne({
        _id: targetId,
        tenantId,
      }).exec();
      if (!invoice) {
        throw new NotFoundException('Facture introuvable');
      }
      await this.invoiceModel
        .updateOne(
          { _id: targetId, tenantId },
          { $set: { status: 'paid' } },
        )
        .exec();
      // Écriture : débit 512 (banque), crédit 411 (clients)
      await this.createBankReconciliationEntries(
        tenantId,
        date,
        reference,
        amount,
        '512000',  // Compte banque
        '411000',  // Clients
        invoice.number,
      );
    } else if (targetType === ReconciliationTargetType.EXPENSE) {
      const expense = await this.expenseModel.findOne({
        _id: targetId,
        tenantId,
      }).exec();
      if (!expense) {
        throw new NotFoundException('Dépense introuvable');
      }
      await this.expenseModel
        .updateOne(
          { _id: targetId, tenantId },
          { $set: { status: 'exported' } },
        )
        .exec();
      // Écriture : débit 401 (fournisseurs), crédit 512 (banque)
      await this.createBankReconciliationEntries(
        tenantId,
        date,
        reference,
        amount,
        '401000',  // Fournisseurs
        '512000',  // Banque
        expense.supplier,
      );
    } else if (targetType === ReconciliationTargetType.PAYROLL || targetType === ReconciliationTargetType.TAX) {
      // Paie / TVA : même logique écriture banque (512) vs charge (421 ou 431)
      await this.createBankReconciliationEntries(
        tenantId,
        date,
        reference,
        amount,
        '421000',  // Personnel - rémunérations dues
        '512000',
        `Paie/TVA ${targetId}`,
      );
    } else {
      throw new BadRequestException('Type de cible non géré');
    }

    await this.bankTransactionModel
      .updateOne(
        { _id: bankTransactionId, tenantId },
        {
          $set: {
            status: BankTransactionStatus.RECONCILED,
            reconciledAt: new Date(),
            targetType,
            targetId,
          },
        },
      )
      .exec();

    return { success: true, message: 'Rapprochement enregistré' };
  }

  private async createBankReconciliationEntries(
    tenantId: string,
    date: Date,
    label: string,
    amount: number,
    debitAccount: string,
    creditAccount: string,
    reference: string,
  ): Promise<void> {
    const entries = [
      {
        tenantId,
        date,
        account: debitAccount,
        label,
        debit: amount,
        credit: 0,
        journal: 'BQ',
        reference,
        validated: false,
        locked: false,
      },
      {
        tenantId,
        date,
        account: creditAccount,
        label,
        debit: 0,
        credit: amount,
        journal: 'BQ',
        reference,
        validated: false,
        locked: false,
      },
    ];
    await this.accountingEntryModel.insertMany(entries);
  }
}
