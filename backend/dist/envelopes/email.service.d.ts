import { EnvelopeDocument, Recipient } from './schemas/envelope.schema';
export declare class EmailService {
    private readonly logger;
    sendSignatureRequestEmail(envelope: EnvelopeDocument, recipient: Recipient): Promise<void>;
    sendEnvelopeCompletedEmail(envelope: EnvelopeDocument, recipient: Recipient): Promise<void>;
    sendEnvelopeRefusedEmail(envelope: EnvelopeDocument, recipient: Recipient, refusingRecipient: Recipient): Promise<void>;
    sendEnvelopeRefusedNotificationToCreator(envelope: EnvelopeDocument, refusingRecipient: Recipient): Promise<void>;
}
