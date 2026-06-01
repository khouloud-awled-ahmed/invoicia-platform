import { Model } from 'mongoose';
import { GEDFolderDocument } from './schemas/ged-folder.schema';
import { GEDClassificationRuleDocument } from './schemas/ged-classification-rule.schema';
export declare class GEDInitializationService {
    private folderModel;
    private ruleModel;
    constructor(folderModel: Model<GEDFolderDocument>, ruleModel: Model<GEDClassificationRuleDocument>);
    initializeDefaultStructure(tenantId: string): Promise<void>;
    private createFolder;
    private createDefaultClassificationRules;
}
