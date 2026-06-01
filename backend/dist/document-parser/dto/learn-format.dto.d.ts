declare class ParserConfigDto {
    startRow?: number;
    dateColumn?: number;
    labelColumn?: number;
    amountColumn?: number;
    dateFormat?: string;
    hasHeader?: boolean;
    delimiter?: string;
    encoding?: string;
    invoiceNumberPattern?: string;
    datePattern?: string;
    totalHTPattern?: string;
    totalTVAPattern?: string;
    totalTTCPattern?: string;
    supplierPattern?: string;
    emailPattern?: string;
    phonePattern?: string;
    skillsKeywords?: string[];
    experienceKeywords?: string[];
}
export declare class LearnFormatDto {
    name: string;
    signature: string;
    type: string;
    config: ParserConfigDto;
    fileType: 'CSV' | 'PDF' | 'DOCX';
}
export {};
