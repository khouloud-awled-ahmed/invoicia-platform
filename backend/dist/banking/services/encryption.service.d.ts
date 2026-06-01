import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private configService;
    private readonly logger;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly saltLength;
    private readonly tagLength;
    private readonly tagPosition;
    private readonly encryptedPosition;
    constructor(configService: ConfigService);
    private getEncryptionKey;
    encrypt(text: string): string;
    decrypt(encryptedText: string): string;
}
