export declare class CreateClassificationRuleDto {
    name: string;
    documentType: string;
    targetFolderId: string;
    keywords?: string[];
    fileExtensions?: string[];
    conditions?: {
        entityType?: string;
        minSize?: number;
        maxSize?: number;
    };
    priority?: number;
}
