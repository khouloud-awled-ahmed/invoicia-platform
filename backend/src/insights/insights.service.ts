import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { Expense, ExpenseDocument } from '../billing/purchases/schemas/expense.schema';
import { BankAccount, BankAccountDocument } from '../banking/schemas/bank-account.schema';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async getAccountingSummary(tenantId: string): Promise<any> {
    if (!process.env.GROQ_API_KEY) {
      throw new BadRequestException('GROQ_API_KEY manquant');
    }

    const accounts = await this.bankAccountModel.find({ tenantId }).exec();
    const treasuryBalance = accounts.reduce((s, a: any) => s + (a.balance || 0), 0);

    const invoices = await this.invoiceModel.find({ tenantId }).exec();
    const expenses = await this.expenseModel.find({ tenantId }).exec();

    const totalRevenue = invoices
      .filter((i: any) => i.status === 'paid')
      .reduce((s, i: any) => s + (i.amountTTC || i.netAPayer || 0), 0);
    const totalExpenses = expenses.reduce((s, e: any) => s + (e.amountTTC || 0), 0);

    const today = new Date();
    const overdueInvoices = invoices.filter(
      (i: any) => i.status !== 'paid' && i.dueDate && new Date(i.dueDate) < today,
    );
    const overdueCount = overdueInvoices.length;
    const overdueAmount = overdueInvoices.reduce((s, i: any) => s + (i.amountTTC || i.netAPayer || 0), 0);

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i: any) => i.status === 'paid').length;
    const paymentRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

    const prompt = `Tu es un analyste financier qui parle simplement, comme a un dirigeant non-expert. Analyse ces indicateurs d'une entreprise tunisienne.
Donnees:
- Solde de tresorerie actuel: ${treasuryBalance.toFixed(2)} TND
- Chiffre d'affaires encaisse: ${totalRevenue.toFixed(2)} TND
- Depenses totales: ${totalExpenses.toFixed(2)} TND
- Factures en retard: ${overdueCount} (montant: ${overdueAmount.toFixed(2)} TND)
- Taux de paiement des factures: ${paymentRate}%

Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou apres, sans markdown, avec exactement cette structure:
{
  "status": "positive ou warning ou critical selon la sante financiere globale",
  "headline": "une phrase courte de 6 a 10 mots qui resume la situation",
  "points": [
    {"label": "court titre de 2-3 mots", "detail": "une phrase courte expliquant ce point"},
    {"label": "court titre de 2-3 mots", "detail": "une phrase courte expliquant ce point"},
    {"label": "court titre de 2-3 mots", "detail": "une phrase courte expliquant ce point"}
  ]
}
Le premier point doit etre ce qui va bien, le deuxieme le probleme principal a regler, le troisieme une recommandation concrete. Reste factuel et base uniquement sur les chiffres fournis.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la generation du resume IA');
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return {
        status: 'warning',
        headline: 'Analyse indisponible pour le moment',
        points: [],
      };
    }
  }
}