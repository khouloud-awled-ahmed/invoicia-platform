import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from '../../../suppliers/schemas/supplier.schema';
export declare class SuppliersService {
    private supplierModel;
    constructor(supplierModel: Model<SupplierDocument>);
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        totalIntervenants: number;
    }>;
    create(createDto: any, tenantId: string): Promise<Supplier>;
    findAll(tenantId: string, filters?: any): Promise<Supplier[]>;
    findOne(id: string, tenantId: string): Promise<Supplier>;
    update(id: string, updateDto: any, tenantId: string): Promise<Supplier>;
    remove(id: string, tenantId: string): Promise<void>;
    toggleStatus(id: string, tenantId: string): Promise<Supplier>;
    addIntervenant(id: string, intervenantId: string, tenantId: string): Promise<Supplier>;
    removeIntervenant(id: string, intervenantId: string, tenantId: string): Promise<Supplier>;
}
