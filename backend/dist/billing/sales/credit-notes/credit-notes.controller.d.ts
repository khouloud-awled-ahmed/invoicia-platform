import { CreditNotesService } from './credit-notes.service';
export declare class CreditNotesController {
    private readonly creditNotesService;
    constructor(creditNotesService: CreditNotesService);
    getDashboard(user: any): Promise<{
        total: number;
        count: number;
        statusDistribution: {
            status: string;
            count: number;
            total: number;
        }[];
    }>;
    getNextNumber(user: any): Promise<{
        number: string;
    }>;
    create(createDto: any, user: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote>;
    findAll(user: any, query: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote[]>;
    findOne(id: string, user: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote>;
    update(id: string, updateDto: any, user: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote>;
    remove(id: string, user: any): Promise<void>;
    validate(id: string, user: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote>;
    archive(id: string, user: any): Promise<import("../../../credit-notes/schemas/credit-note.schema").CreditNote>;
}
