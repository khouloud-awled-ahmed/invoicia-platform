import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly tagPosition = this.saltLength + this.ivLength;
  private readonly encryptedPosition = this.tagPosition + this.tagLength;

  constructor(private configService: ConfigService) {}

  /**
   * Génère une clé de chiffrement à partir d'une clé maître
   * En production, utilisez une clé maître stockée de manière sécurisée (AWS KMS, HashiCorp Vault, etc.)
   */
  private getEncryptionKey(): Buffer {
    const masterKey =
      this.configService.get<string>('ENCRYPTION_MASTER_KEY') ||
      process.env.ENCRYPTION_MASTER_KEY ||
      'default-master-key-change-in-production-minimum-32-characters-long';

    if (masterKey.length < 32) {
      this.logger.warn('ENCRYPTION_MASTER_KEY is too short. Using default (INSECURE).');
    }

    // Dériver une clé de 32 bytes depuis la clé maître
    return crypto.scryptSync(masterKey, 'salt', this.keyLength);
  }

  /**
   * Chiffre une valeur sensible
   */
  encrypt(text: string): string {
    if (!text) {
      return text;
    }

    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      const salt = crypto.randomBytes(this.saltLength);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      // Combiner: salt + iv + tag + encrypted
      const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')]);

      return result.toString('base64');
    } catch (error) {
      this.logger.error('Erreur lors du chiffrement:', error);
      throw new Error('Erreur lors du chiffrement des données');
    }
  }

  /**
   * Déchiffre une valeur chiffrée
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText) {
      return encryptedText;
    }

    try {
      const key = this.getEncryptionKey();
      const data = Buffer.from(encryptedText, 'base64');

      // Extraire les composants
      const salt = data.subarray(0, this.saltLength);
      const iv = data.subarray(this.saltLength, this.tagPosition);
      const tag = data.subarray(this.tagPosition, this.encryptedPosition);
      const encrypted = data.subarray(this.encryptedPosition);

      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(encrypted, undefined, 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      this.logger.error('Erreur lors du déchiffrement:', error);
      throw new Error('Erreur lors du déchiffrement des données');
    }
  }
}
