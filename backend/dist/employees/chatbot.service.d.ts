import { Model } from 'mongoose';
import { CVDocument } from './schemas/cv.schema';
import { EmployeeDocument } from './schemas/employee.schema';
import { InvoiceDocument } from '../billing/sales/schemas/invoice.schema';
import { ClientDocument } from '../clients/schemas/client.schema';
export declare class ChatbotService {
    private cvModel;
    private employeeModel;
    private invoiceModel;
    private clientModel;
    private readonly logger;
    private readonly chatbotUrl;
    constructor(cvModel: Model<CVDocument>, employeeModel: Model<EmployeeDocument>, invoiceModel: Model<InvoiceDocument>, clientModel: Model<ClientDocument>);
    chat(question: string, tenantId: string): Promise<string>;
}
