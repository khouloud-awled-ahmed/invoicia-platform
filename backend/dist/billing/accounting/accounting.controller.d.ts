import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private readonly accountingService;
    constructor(accountingService: AccountingService);
    create(createDto: any, user: any): Promise<import("../../accounting/schemas/accounting-entry.schema").AccountingEntry>;
    findAll(filters: any, user: any): Promise<import("../../accounting/schemas/accounting-entry.schema").AccountingEntry[]>;
    findOne(id: string, user: any): Promise<import("../../accounting/schemas/accounting-entry.schema").AccountingEntry>;
    update(id: string, updateDto: any, user: any): Promise<import("../../accounting/schemas/accounting-entry.schema").AccountingEntry>;
    remove(id: string, user: any): Promise<void>;
}
