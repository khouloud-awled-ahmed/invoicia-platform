import { SuppliersService } from './suppliers.service';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    getStats(user: any): Promise<{
        total: number;
        active: number;
        inactive: number;
        totalIntervenants: number;
    }>;
    create(createDto: any, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
    findAll(user: any, query: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier[]>;
    findOne(id: string, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
    update(id: string, updateDto: any, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
    remove(id: string, user: any): Promise<void>;
    toggleStatus(id: string, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
    addIntervenant(id: string, intervenantId: string, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
    removeIntervenant(id: string, intervenantId: string, user: any): Promise<import("../../../suppliers/schemas/supplier.schema").Supplier>;
}
