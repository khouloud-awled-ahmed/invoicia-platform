import { Model, Connection } from 'mongoose';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';
export declare class AttachmentsService {
    private attachmentModel;
    private connection;
    private gridFSBucket;
    constructor(attachmentModel: Model<AttachmentDocument>, connection: Connection);
    private initGridFS;
    private getGridFSBucket;
    upload(file: any, entityType: string, entityId: string, tenantId: string, uploadedBy?: string): Promise<Attachment>;
    findAll(entityType: string, entityId: string, tenantId: string): Promise<Attachment[]>;
    findOne(id: string, tenantId: string): Promise<Attachment>;
    getFileStream(attachmentId: string, tenantId: string): Promise<{
        stream: NodeJS.ReadableStream;
        attachment: Attachment;
    }>;
    delete(id: string, tenantId: string): Promise<void>;
    deleteByEntity(entityType: string, entityId: string, tenantId: string): Promise<void>;
}
