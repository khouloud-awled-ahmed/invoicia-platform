export declare enum BankingProvider {
    GOCARDLESS = "GOCARDLESS",
    BRIDGE = "BRIDGE"
}
export declare class UpdateBankingConfigDto {
    provider: BankingProvider;
    clientId: string;
    clientSecret: string;
    isActive?: boolean;
    redirectUri?: string;
    baseUrl?: string;
}
