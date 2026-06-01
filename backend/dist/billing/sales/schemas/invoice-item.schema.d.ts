export declare class InvoiceItem {
    article: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    vatRate: number;
}
export declare const InvoiceItemSchema: import("mongoose").Schema<InvoiceItem, import("mongoose").Model<InvoiceItem, any, any, any, import("mongoose").Document<unknown, any, InvoiceItem, any, {}> & InvoiceItem & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, InvoiceItem, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<InvoiceItem>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<InvoiceItem> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
