import { EnvelopeDocument, Recipient } from './schemas/envelope.schema';
import { EmailService } from './email.service';
export declare class WorkflowEngine {
    private emailService;
    private readonly logger;
    constructor(emailService: EmailService);
    processEnvelopeSent(envelope: EnvelopeDocument): Promise<void>;
    processNextSigner(envelope: EnvelopeDocument, signedRecipient: Recipient): Promise<void>;
    processEnvelopeCompleted(envelope: EnvelopeDocument): Promise<void>;
    processEnvelopeRefused(envelope: EnvelopeDocument, refusingRecipient: Recipient): Promise<void>;
}
