declare class ParserConfigDto {
    startRow: number;
    dateColumn: number;
    labelColumn: number;
    amountColumn: number;
    dateFormat: string;
    hasHeader: boolean;
    delimiter?: string;
    encoding?: string;
}
export declare class LearnFormatDto {
    name: string;
    signature: string;
    config: ParserConfigDto;
    fileType: 'CSV' | 'PDF';
}
export {};
