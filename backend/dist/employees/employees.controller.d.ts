import { EmployeesService } from './employees.service';
import { UniversalDocumentParserService } from '../document-parser/services/universal-document-parser.service';
import { ChatbotService } from './chatbot.service';
export declare class EmployeesController {
    private readonly employeesService;
    private readonly documentParser;
    private readonly chatbotService;
    private readonly logger;
    constructor(employeesService: EmployeesService, documentParser: UniversalDocumentParserService, chatbotService: ChatbotService);
    create(createDto: any, user: any): Promise<import("./schemas/employee.schema").Employee>;
    findAll(user: any): Promise<import("./schemas/employee.schema").Employee[]>;
    getCVs(user: any): Promise<import("./schemas/cv.schema").CVDocument[]>;
    findOne(id: string, user: any): Promise<import("./schemas/employee.schema").Employee>;
    update(id: string, updateDto: any, user: any): Promise<import("./schemas/employee.schema").Employee>;
    remove(id: string, user: any): Promise<void>;
    uploadCV(file: any, user: any): Promise<{
        id: string;
        fileName: string;
        name: string;
        email: string;
        rawText: string;
        createdAt: any;
        extractedData: {
            firstName: any;
            lastName: any;
            email: string;
            phone: any;
            title: any;
            summary: any;
            yearsOfExperience: number;
            city: string;
            skills: any;
            experiences: any;
            education: any;
            certifications: any[];
            languages: any[];
        };
    }>;
    chatbot(body: {
        question: string;
    }, user: any): Promise<{
        answer: string;
    }>;
}
