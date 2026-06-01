import { Model } from 'mongoose';
import { AccountingEntry, AccountingEntryDocument } from '../../accounting/schemas/accounting-entry.schema';
export declare class AccountingService {
    private accountingEntryModel;
    constructor(accountingEntryModel: Model<AccountingEntryDocument>);
    create(createDto: any, tenantId: string): Promise<AccountingEntry>;
    findAll(tenantId: string, filters?: any): Promise<AccountingEntry[]>;
    findOne(id: string, tenantId: string): Promise<AccountingEntry>;
    update(id: string, updateDto: any, tenantId: string): Promise<AccountingEntry>;
    remove(id: string, tenantId: string): Promise<void>;
}
