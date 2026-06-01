import { Document } from 'mongoose';
import { ClientContact } from './client-contact.schema';
export type ClientDocument = Client & Document;
export declare class Client {
    name: string;
    businessName?: string;
    email?: string;
    phone?: string;
    address?: string;
    matriculeFiscal?: string;
    vatNumber?: string;
    withholdingTax?: boolean;
    withholdingTaxRate?: number;
    contacts: ClientContact[];
    tenantId: string;
    metadata?: Record<string, any>;
}
export declare const ClientSchema: import("mongoose").Schema<Client, import("mongoose").Model<Client, any, any, any, Document<unknown, any, Client, any, {}> & Client & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Client, Document<unknown, {}, import("mongoose").FlatRecord<Client>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Client> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
