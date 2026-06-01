import { EnvelopeDocument } from './schemas/envelope.schema';
export declare class CertificateService {
    private readonly logger;
    private readonly certificatesDir;
    private readonly signedDocumentsDir;
    generateCertificate(envelope: EnvelopeDocument): Promise<string>;
    mergeSignaturesToDocument(envelope: EnvelopeDocument): Promise<string>;
    private getActionLabel;
}
