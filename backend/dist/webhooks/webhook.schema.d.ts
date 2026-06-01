import { Document } from 'mongoose';
export declare class Webhook extends Document {
    name: string;
    url: string;
    events: string[];
    active: boolean;
    tenantId: string;
    secret: string;
}
export declare const WebhookSchema: import("mongoose").Schema<Webhook, import("mongoose").Model<Webhook, any, any, any, Document<unknown, any, Webhook, any, {}> & Webhook & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Webhook, Document<unknown, {}, import("mongoose").FlatRecord<Webhook>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Webhook> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
