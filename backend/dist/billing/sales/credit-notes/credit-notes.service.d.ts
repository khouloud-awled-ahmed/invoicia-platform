import { Model } from 'mongoose';
import { CreditNote, CreditNoteDocument } from '../../../credit-notes/schemas/credit-note.schema';
export declare class CreditNotesService {
    private creditNoteModel;
    constructor(creditNoteModel: Model<CreditNoteDocument>);
    private calculateTotals;
    private generateNumber;
    getNextNumber(tenantId: string): Promise<{
        number: string;
    }>;
    create(createDto: any, tenantId: string): Promise<CreditNote>;
    findAll(tenantId: string, filters?: any): Promise<CreditNote[]>;
    findOne(id: string, tenantId: string): Promise<CreditNote>;
    update(id: string, updateDto: any, tenantId: string): Promise<CreditNote>;
    remove(id: string, tenantId: string): Promise<void>;
    validate(id: string, tenantId: string): Promise<CreditNote>;
    archive(id: string, tenantId: string): Promise<CreditNote>;
    getDashboard(tenantId: string): Promise<{
        total: number;
        count: number;
        statusDistribution: {
            status: string;
            count: number;
            total: number;
        }[];
    }>;
}
