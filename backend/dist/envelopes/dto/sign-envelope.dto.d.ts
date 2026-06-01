export declare class FieldValueDto {
    fieldId: string;
    value?: string;
    signatureData?: string;
}
export declare class SignEnvelopeDto {
    securityCode?: string;
    fieldValues: FieldValueDto[];
}
