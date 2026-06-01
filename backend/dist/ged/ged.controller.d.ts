import { GEDService } from './ged.service';
import { GEDInitializationService } from './ged-initialization.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateClassificationRuleDto } from './dto/create-classification-rule.dto';
export declare class GEDController {
    private readonly gedService;
    private readonly initializationService;
    constructor(gedService: GEDService, initializationService: GEDInitializationService);
    createFolder(createFolderDto: CreateFolderDto, user: any): Promise<import("./schemas/ged-folder.schema").GEDFolder>;
    getFolderTree(user: any, rootFolderId?: string): Promise<any[]>;
    getFolder(id: string, user: any): Promise<{
        id: string;
        message: string;
    }>;
    updateFolder(id: string, updates: {
        name?: string;
        description?: string;
        documentType?: string;
    }, user: any): Promise<import("./schemas/ged-folder.schema").GEDFolder>;
    moveFolder(id: string, body: {
        newParentId: string | null;
    }, user: any): Promise<import("./schemas/ged-folder.schema").GEDFolder>;
    deleteFolder(id: string, force: string, user: any): Promise<void>;
    uploadDocument(file: any, folderId: string, documentType: string, metadata: any, user: any): Promise<import("./schemas/ged-document.schema").GEDDocument>;
    getDocuments(folderId: string, documentType: string, archived: string, user: any): Promise<import("./schemas/ged-document.schema").GEDDocument[]>;
    moveDocument(id: string, body: {
        newFolderId: string | null;
    }, user: any): Promise<import("./schemas/ged-document.schema").GEDDocument>;
    deleteDocument(id: string, user: any): Promise<void>;
    createClassificationRule(createRuleDto: CreateClassificationRuleDto, user: any): Promise<import("./schemas/ged-classification-rule.schema").GEDClassificationRule>;
    getClassificationRules(user: any): Promise<import("./schemas/ged-classification-rule.schema").GEDClassificationRule[]>;
    updateClassificationRule(id: string, updates: Partial<CreateClassificationRuleDto>, user: any): Promise<import("./schemas/ged-classification-rule.schema").GEDClassificationRule>;
    deleteClassificationRule(id: string, user: any): Promise<void>;
    initializeStructure(user: any): Promise<{
        message: string;
    }>;
}
