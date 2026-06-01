import { Model } from 'mongoose';
import { GEDFolder, GEDFolderDocument } from './schemas/ged-folder.schema';
import { GEDDocument, GEDDocumentDocument } from './schemas/ged-document.schema';
import { GEDClassificationRule, GEDClassificationRuleDocument } from './schemas/ged-classification-rule.schema';
import { AttachmentsService } from '../attachments/attachments.service';
export declare class GEDService {
    private folderModel;
    private documentModel;
    private ruleModel;
    private attachmentsService;
    constructor(folderModel: Model<GEDFolderDocument>, documentModel: Model<GEDDocumentDocument>, ruleModel: Model<GEDClassificationRuleDocument>, attachmentsService: AttachmentsService);
    createFolder(tenantId: string, name: string, parentId?: string, documentType?: string, description?: string): Promise<GEDFolder>;
    getFolderTree(tenantId: string, rootFolderId?: string): Promise<any[]>;
    updateFolder(id: string, tenantId: string, updates: {
        name?: string;
        description?: string;
        documentType?: string;
    }): Promise<GEDFolder>;
    private updateFolderPathRecursive;
    moveFolder(folderId: string, newParentId: string | null, tenantId: string): Promise<GEDFolder>;
    deleteFolder(id: string, tenantId: string, force?: boolean): Promise<void>;
    uploadDocument(file: any, tenantId: string, folderId?: string, documentType?: string, metadata?: any, uploadedBy?: string): Promise<GEDDocument>;
    private classifyDocument;
    private detectDocumentType;
    getDocuments(tenantId: string, folderId?: string, documentType?: string, archived?: boolean): Promise<GEDDocument[]>;
    moveDocument(documentId: string, newFolderId: string | null, tenantId: string): Promise<GEDDocument>;
    deleteDocument(id: string, tenantId: string): Promise<void>;
    private updateFolderDocumentCount;
    createClassificationRule(tenantId: string, ruleData: {
        name: string;
        documentType: string;
        targetFolderId: string;
        keywords?: string[];
        fileExtensions?: string[];
        conditions?: any;
        priority?: number;
    }): Promise<GEDClassificationRule>;
    getClassificationRules(tenantId: string): Promise<GEDClassificationRule[]>;
    updateClassificationRule(id: string, tenantId: string, updates: Partial<GEDClassificationRule>): Promise<GEDClassificationRule>;
    deleteClassificationRule(id: string, tenantId: string): Promise<void>;
}
