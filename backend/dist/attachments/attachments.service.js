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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const attachment_schema_1 = require("./schemas/attachment.schema");
const mongodb_1 = require("mongodb");
let AttachmentsService = class AttachmentsService {
    constructor(attachmentModel, connection) {
        this.attachmentModel = attachmentModel;
        this.connection = connection;
        this.initGridFS();
    }
    initGridFS() {
        try {
            if (this.connection.readyState === 1) {
                this.gridFSBucket = new mongodb_1.GridFSBucket(this.connection.db, {
                    bucketName: 'attachments',
                });
            }
            else {
                setTimeout(() => this.initGridFS(), 100);
            }
        }
        catch (error) {
            console.error('Error initializing GridFS:', error);
        }
    }
    getGridFSBucket() {
        if (!this.gridFSBucket) {
            this.gridFSBucket = new mongodb_1.GridFSBucket(this.connection.db, {
                bucketName: 'attachments',
            });
        }
        return this.gridFSBucket;
    }
    async upload(file, entityType, entityId, tenantId, uploadedBy) {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Type de fichier non autorisé');
        }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('Fichier trop volumineux (max 10MB)');
        }
        const timestamp = Date.now();
        const randomString = new mongodb_1.ObjectId().toString().substring(0, 8);
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFileName = `${entityType}/${entityId}/${timestamp}-${randomString}.${fileExtension}`;
        const bucket = this.getGridFSBucket();
        return new Promise((resolve, reject) => {
            const uploadStream = bucket.openUploadStream(uniqueFileName, {
                contentType: file.mimetype,
                metadata: {
                    tenantId,
                    entityType,
                    entityId,
                    originalName: file.originalname,
                    uploadedBy,
                },
            });
            uploadStream.on('finish', async () => {
                try {
                    const attachment = new this.attachmentModel({
                        tenantId,
                        entityType,
                        entityId,
                        fileName: file.originalname,
                        fileSize: file.size,
                        fileType: file.mimetype,
                        gridFsFileId: uploadStream.id.toString(),
                        uploadedBy: uploadedBy || 'unknown',
                    });
                    const savedAttachment = await attachment.save();
                    resolve(savedAttachment);
                }
                catch (error) {
                    bucket.delete(uploadStream.id);
                    reject(error);
                }
            });
            uploadStream.on('error', (error) => {
                reject(error);
            });
            uploadStream.end(file.buffer);
        });
    }
    async findAll(entityType, entityId, tenantId) {
        return this.attachmentModel
            .find({ tenantId, entityType, entityId })
            .sort({ createdAt: -1 })
            .exec();
    }
    async findOne(id, tenantId) {
        const query = tenantId ? { _id: id, tenantId } : { _id: id };
        const attachment = await this.attachmentModel.findOne(query).exec();
        if (!attachment) {
            throw new common_1.NotFoundException(`Attachment with ID ${id} not found`);
        }
        return attachment;
    }
    async getFileStream(attachmentId, tenantId) {
        const attachment = await this.findOne(attachmentId, tenantId);
        const fileId = new mongodb_1.ObjectId(attachment.gridFsFileId);
        const bucket = this.getGridFSBucket();
        const files = await bucket.find({ _id: fileId }).toArray();
        if (files.length === 0) {
            throw new common_1.NotFoundException('File not found in storage');
        }
        const downloadStream = bucket.openDownloadStream(fileId);
        return { stream: downloadStream, attachment };
    }
    async delete(id, tenantId) {
        const attachment = await this.findOne(id, tenantId);
        const fileId = new mongodb_1.ObjectId(attachment.gridFsFileId);
        const bucket = this.getGridFSBucket();
        await bucket.delete(fileId);
        const attachmentId = attachment._id;
        await this.attachmentModel.findByIdAndDelete(attachmentId).exec();
    }
    async deleteByEntity(entityType, entityId, tenantId) {
        const attachments = await this.findAll(entityType, entityId, tenantId);
        const bucket = this.getGridFSBucket();
        for (const attachment of attachments) {
            try {
                const fileId = new mongodb_1.ObjectId(attachment.gridFsFileId);
                await bucket.delete(fileId);
            }
            catch (error) {
                console.error(`Error deleting file ${attachment.gridFsFileId}:`, error);
            }
        }
        await this.attachmentModel.deleteMany({ tenantId, entityType, entityId }).exec();
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attachment_schema_1.Attachment.name)),
    __param(1, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Connection])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map