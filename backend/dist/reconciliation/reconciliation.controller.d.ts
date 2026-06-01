import { ReconciliationService } from './reconciliation.service';
import { MatchReconciliationDto } from './dto/match-reconciliation.dto';
export declare class ReconciliationController {
    private readonly reconciliationService;
    constructor(reconciliationService: ReconciliationService);
    getOpenItems(user: any): Promise<import("./reconciliation.service").OpenItemsResponse>;
    match(user: any, dto: MatchReconciliationDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
