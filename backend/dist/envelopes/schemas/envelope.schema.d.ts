import { Document } from 'mongoose';
export type EnvelopeDocument = Envelope & Document;
export declare enum EnvelopeStatus {
    DRAFT = "DRAFT",
    SENT = "SENT",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    VOIDED = "VOIDED",
    EXPIRED = "EXPIRED"
}
export declare enum RecipientStatus {
    WAITING = "WAITING",
    SENT = "SENT",
    SIGNED = "SIGNED",
    REFUSED = "REFUSED"
}
export declare enum RecipientRole {
    SIGNER = "SIGNER",
    VIEWER = "VIEWER"
}
export declare enum FieldType {
    SIGNATURE = "SIGNATURE",
    INITIALS = "INITIALS",
    DATE = "DATE",
    TEXT = "TEXT",
    CHECKBOX = "CHECKBOX"
}
export declare class AuditEvent {
    timestamp: Date;
    action: string;
    actorEmail?: string;
    actorName?: string;
    ipAddress?: string;
    metadata?: Record<string, any>;
}
export declare const AuditEventSchema: import("mongoose").Schema<AuditEvent, import("mongoose").Model<AuditEvent, any, any, any, Document<unknown, any, AuditEvent, any, {}> & AuditEvent & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AuditEvent, Document<unknown, {}, import("mongoose").FlatRecord<AuditEvent>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<AuditEvent> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Field {
    id: string;
    type: FieldType;
    pageNumber: number;
    xPosition: number;
    yPosition: number;
    width: number;
    height: number;
    assignedRecipientId: string;
    linkedDocumentId: string;
    required: boolean;
    label?: string;
    value?: string;
    defaultValue?: boolean;
    signedAt?: Date;
    signedBy?: string;
    signatureData?: string;
}
export declare const FieldSchema: import("mongoose").Schema<Field, import("mongoose").Model<Field, any, any, any, Document<unknown, any, Field, any, {}> & Field & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Field, Document<unknown, {}, import("mongoose").FlatRecord<Field>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Field> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class EnvelopeDocumentFile {
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    order: number;
    signedFileUrl?: string;
}
export declare const EnvelopeDocumentFileSchema: import("mongoose").Schema<EnvelopeDocumentFile, import("mongoose").Model<EnvelopeDocumentFile, any, any, any, Document<unknown, any, EnvelopeDocumentFile, any, {}> & EnvelopeDocumentFile & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EnvelopeDocumentFile, Document<unknown, {}, import("mongoose").FlatRecord<EnvelopeDocumentFile>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EnvelopeDocumentFile> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Recipient {
    id: string;
    name: string;
    email: string;
    role: RecipientRole;
    routingOrder: number;
    status: RecipientStatus;
    securityCode?: string;
    signedAt?: Date;
    refusedAt?: Date;
    refusalReason?: string;
    ipAddress?: string;
    color?: string;
    userAgent?: string;
}
export declare const RecipientSchema: import("mongoose").Schema<Recipient, import("mongoose").Model<Recipient, any, any, any, Document<unknown, any, Recipient, any, {}> & Recipient & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Recipient, Document<unknown, {}, import("mongoose").FlatRecord<Recipient>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Recipient> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Envelope {
    title: string;
    status: EnvelopeStatus;
    currentRoutingOrder: number;
    recipients: Recipient[];
    documents: EnvelopeDocumentFile[];
    fields: Field[];
    auditTrail: AuditEvent[];
    message?: string;
    expiresAt?: Date;
    createdBy: string;
    tenantId: string;
    certificateUrl?: string;
    completedAt?: Date;
}
export declare const EnvelopeSchema: import("mongoose").Schema<Envelope, import("mongoose").Model<Envelope, any, any, any, Document<unknown, any, Envelope, any, {}> & Envelope & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Envelope, Document<unknown, {}, import("mongoose").FlatRecord<Envelope>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Envelope> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
