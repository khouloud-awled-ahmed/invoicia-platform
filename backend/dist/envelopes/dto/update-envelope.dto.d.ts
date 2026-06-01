import { EnvelopeStatus } from '../schemas/envelope.schema';
export declare class UpdateEnvelopeDto {
    title?: string;
    message?: string;
    status?: EnvelopeStatus;
}
