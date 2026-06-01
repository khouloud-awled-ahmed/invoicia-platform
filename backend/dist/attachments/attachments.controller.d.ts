import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    upload(file: any, entityType: string, entityId: string, user: any): Promise<{
        success: boolean;
        data: {
            id: any;
            entityType: string;
            entityId: string;
            fileName: string;
            fileSize: number;
            fileType: string;
            uploadedAt: any;
            uploadedBy: string;
        };
    }>;
    download(id: string, res: Response): Promise<void>;
    findAll(entityType: string, entityId: string, user: any): Promise<{
        success: boolean;
        data: {
            id: any;
            entityType: string;
            entityId: string;
            fileName: string;
            fileSize: number;
            fileType: string;
            fileUrl: string;
            uploadedAt: any;
            uploadedBy: string;
        }[];
    }>;
    delete(id: string, user: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
