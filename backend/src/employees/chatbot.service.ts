import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CV, CVDocument } from './schemas/cv.schema';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { Invoice, InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { Client, ClientDocument } from '../clients/schemas/client.schema';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    @InjectModel(CV.name) private cvModel: Model<CVDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async chat(question: string, tenantId: string): Promise<string> {
    try {
      const [cvs, employees, invoices, clients] = await Promise.all([
        this.cvModel.find({ tenantId }).limit(10).lean(),
        this.employeeModel.find({ tenantId }).limit(20).lean(),
        this.invoiceModel.find({ tenantId }).limit(20).lean(),
        this.clientModel.find({ tenantId }).limit(20).lean(),
      ]);

      const context = {
        candidates: cvs.map((cv) => ({
          name: cv.name || cv.fileName,
          email: cv.email,
          rawText: cv.rawText?.substring(0, 300),
        })),
        employees: employees.map((e) => ({
          name: `${e.firstName} ${e.lastName}`,
          position: e.position,
          department: e.department,
          salary: e.salary,
          status: e.status,
        })),
        invoices: invoices.map((i: any) => ({
          number: i.number,
          client: i.client,
          amount: i.totalTTC,
          status: i.status,
          date: i.date,
          dueDate: i.dueDate,
        })),
        clients: clients.map((c: any) => ({
          name: c.name,
          email: c.email,
          phone: c.phone,
        })),
      };

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return "Le service IA n'est pas configure (cle Groq manquante).";
      }

      const prompt = `Tu es un assistant RH pour une entreprise. Reponds a la question en te basant UNIQUEMENT sur les donnees ci-dessous. Reponds TOUJOURS dans la meme langue que la question posee (francais si la question est en francais, anglais si elle est en anglais, etc.), de maniere concise et utile. Si la reponse n'est pas dans les donnees, dis-le clairement dans la meme langue.

DONNEES DE L'ENTREPRISE:
Candidats (CVs): ${JSON.stringify(context.candidates)}
Employes: ${JSON.stringify(context.employees)}
Factures: ${JSON.stringify(context.invoices)}
Clients: ${JSON.stringify(context.clients)}

QUESTION: ${question}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          reasoning_effort: 'low',
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Erreur API Groq (${response.status}): ${errText}`);
        return 'Erreur lors de la connexion au service IA.';
      }

      const result: any = await response.json();
      this.logger.log(`Groq raw response: ${JSON.stringify(result).substring(0, 1000)}`);
      const content = result.choices?.[0]?.message?.content;
      return content || 'Pas de reponse';
    } catch (error) {
      this.logger.error('Erreur chatbot:', error);
      return 'Erreur lors de la connexion au chatbot.';
    }
  }
}
