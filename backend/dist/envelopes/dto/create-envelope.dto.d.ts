import { RecipientRole } from '../schemas/envelope.schema';
export declare class CreateRecipientDto {
    name: string;
    email: string;
    role: RecipientRole;
    securityCode?: string;
}
export declare class CreateDocumentDto {
    id?: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    order: number;
}
export declare class CreateEnvelopeDto {
    title: string;
    message?: string;
    expiresAt?: string;
    documents: CreateDocumentDto[];
    recipients: CreateRecipientDto[];
}
