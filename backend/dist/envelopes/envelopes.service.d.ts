import { Model } from 'mongoose';
import { EnvelopeDocument, EnvelopeStatus } from './schemas/envelope.schema';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { SignEnvelopeDto } from './dto/sign-envelope.dto';
import { RefuseEnvelopeDto } from './dto/refuse-envelope.dto';
import { WorkflowEngine } from './workflow-engine.service';
import { CertificateService } from './certificate.service';
export declare class EnvelopesService {
    private envelopeModel;
    private workflowEngine;
    private certificateService;
    private readonly logger;
    constructor(envelopeModel: Model<EnvelopeDocument>, workflowEngine: WorkflowEngine, certificateService: CertificateService);
    create(createEnvelopeDto: CreateEnvelopeDto, userId: string, tenantId: string): Promise<EnvelopeDocument>;
    findAll(tenantId: string, filters?: {
        status?: EnvelopeStatus;
    }): Promise<EnvelopeDocument[]>;
    findOne(id: string, tenantId: string): Promise<EnvelopeDocument>;
    findByRecipientEmail(email: string): Promise<EnvelopeDocument[]>;
    update(id: string, updateEnvelopeDto: UpdateEnvelopeDto, tenantId: string): Promise<EnvelopeDocument>;
    addFields(id: string, fields: CreateFieldDto[], tenantId: string): Promise<EnvelopeDocument>;
    send(id: string, tenantId: string, ipAddress?: string): Promise<EnvelopeDocument>;
    sign(id: string, signDto: SignEnvelopeDto, recipientEmail: string, ipAddress: string, userAgent: string): Promise<EnvelopeDocument>;
    refuse(id: string, refuseDto: RefuseEnvelopeDto, recipientEmail: string, ipAddress: string, userAgent?: string): Promise<EnvelopeDocument>;
    private getRecipientColor;
    remove(id: string, tenantId: string): Promise<void>;
    getSignedDocumentPath(id: string, tenantId: string): Promise<string | null>;
    getCertificatePath(id: string, tenantId: string): Promise<string | null>;
}
