import { Response } from 'express';
import { EnvelopesService } from './envelopes.service';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import { SignEnvelopeDto } from './dto/sign-envelope.dto';
import { RefuseEnvelopeDto } from './dto/refuse-envelope.dto';
export declare class EnvelopesController {
    private readonly envelopesService;
    constructor(envelopesService: EnvelopesService);
    create(createEnvelopeDto: CreateEnvelopeDto, user: any, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    findAll(user: any, req: any, status?: string): Promise<import("./schemas/envelope.schema").EnvelopeDocument[]>;
    findMySignatures(email: string): Promise<import("./schemas/envelope.schema").EnvelopeDocument[]>;
    findOne(id: string, user: any, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    update(id: string, updateEnvelopeDto: UpdateEnvelopeDto, user: any, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    addFields(id: string, body: any, user: any, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    send(id: string, user: any, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    sign(id: string, signDto: SignEnvelopeDto, email: string, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    refuse(id: string, refuseDto: RefuseEnvelopeDto, email: string, req: any): Promise<import("./schemas/envelope.schema").EnvelopeDocument>;
    downloadSignedDocument(id: string, user: any, req: any, res: Response): Promise<void>;
    downloadCertificate(id: string, user: any, req: any, res: Response): Promise<void>;
    remove(id: string, user: any, req: any): Promise<void>;
}
