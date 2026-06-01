import { FieldType } from '../schemas/envelope.schema';
export declare class CreateFieldDto {
    type: FieldType;
    pageNumber: number;
    xPosition: number;
    yPosition: number;
    width: number;
    height: number;
    assignedRecipientId: string;
    linkedDocumentId: string;
    label?: string;
    defaultValue?: boolean;
}
