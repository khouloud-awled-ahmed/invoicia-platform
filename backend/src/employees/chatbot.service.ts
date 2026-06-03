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
  private readonly chatbotUrl = process.env.CHATBOT_URL || '';

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

      const response = await fetch(`${this.chatbotUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ question, ...context }),
      });

      const data = await response.json();
      return data.answer || 'Pas de reponse';
    } catch (error) {
      this.logger.error('Erreur chatbot:', error);
      return 'Erreur lors de la connexion au chatbot.';
    }
  }
}
