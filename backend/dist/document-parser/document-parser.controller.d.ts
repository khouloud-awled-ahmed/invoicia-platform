import { UniversalDocumentParserService } from './services/universal-document-parser.service';
export declare class DocumentParserController {
    private readonly parserService;
    constructor(parserService: UniversalDocumentParserService);
    analyze(file: any, type: string, user: any): Promise<import("./services/universal-document-parser.service").AnalyzeFileResult>;
    aiScan(file: any, user: any): Promise<any>;
    learnFormat(templateName: string, user: any): Promise<{
        message: string;
    }>;
    getTemplates(type: string, user: any): Promise<import("./schemas/parsing-template.schema").ParsingTemplateDocument[]>;
    deleteTemplate(id: string, user: any): Promise<void>;
}
