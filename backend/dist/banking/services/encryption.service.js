"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let EncryptionService = EncryptionService_1 = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EncryptionService_1.name);
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.saltLength = 64;
        this.tagLength = 16;
        this.tagPosition = this.saltLength + this.ivLength;
        this.encryptedPosition = this.tagPosition + this.tagLength;
    }
    getEncryptionKey() {
        const masterKey = this.configService.get('ENCRYPTION_MASTER_KEY') ||
            process.env.ENCRYPTION_MASTER_KEY ||
            'default-master-key-change-in-production-minimum-32-characters-long';
        if (masterKey.length < 32) {
            this.logger.warn('ENCRYPTION_MASTER_KEY is too short. Using default (INSECURE).');
        }
        return crypto.scryptSync(masterKey, 'salt', this.keyLength);
    }
    encrypt(text) {
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
            const result = Buffer.concat([
                salt,
                iv,
                tag,
                Buffer.from(encrypted, 'hex'),
            ]);
            return result.toString('base64');
        }
        catch (error) {
            this.logger.error('Erreur lors du chiffrement:', error);
            throw new Error('Erreur lors du chiffrement des données');
        }
    }
    decrypt(encryptedText) {
        if (!encryptedText) {
            return encryptedText;
        }
        try {
            const key = this.getEncryptionKey();
            const data = Buffer.from(encryptedText, 'base64');
            const salt = data.subarray(0, this.saltLength);
            const iv = data.subarray(this.saltLength, this.tagPosition);
            const tag = data.subarray(this.tagPosition, this.encryptedPosition);
            const encrypted = data.subarray(this.encryptedPosition);
            const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(encrypted, undefined, 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error('Erreur lors du déchiffrement:', error);
            throw new Error('Erreur lors du déchiffrement des données');
        }
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map