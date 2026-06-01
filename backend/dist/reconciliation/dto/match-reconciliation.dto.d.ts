export declare enum ReconciliationTargetType {
    INVOICE = "INVOICE",
    EXPENSE = "EXPENSE",
    PAYROLL = "PAYROLL",
    TAX = "TAX"
}
export declare class MatchReconciliationDto {
    bankTransactionId: string;
    targetId: string;
    targetType: ReconciliationTargetType;
}
