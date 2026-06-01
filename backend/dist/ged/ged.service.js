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
exports.GEDService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ged_folder_schema_1 = require("./schemas/ged-folder.schema");
const ged_document_schema_1 = require("./schemas/ged-document.schema");
const ged_classification_rule_schema_1 = require("./schemas/ged-classification-rule.schema");
const attachments_service_1 = require("../attachments/attachments.service");
let GEDService = class GEDService {
    constructor(folderModel, documentModel, ruleModel, attachmentsService) {
        this.folderModel = folderModel;
        this.documentModel = documentModel;
        this.ruleModel = ruleModel;
        this.attachmentsService = attachmentsService;
    }
    async createFolder(tenantId, name, parentId, documentType, description) {
        let parentPath = '/';
        if (parentId) {
            const parent = await this.folderModel.findOne({ _id: parentId, tenantId }).exec();
            if (!parent) {
                throw new common_1.NotFoundException(`Parent folder with ID ${parentId} not found`);
            }
            parentPath = parent.path;
        }
        const fullPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
        const existingFolder = await this.folderModel
            .findOne({ tenantId, parentId: parentId || null, name })
            .exec();
        if (existingFolder) {
            throw new common_1.BadRequestException(`A folder with the name "${name}" already exists in this location`);
        }
        const folder = new this.folderModel({
            tenantId,
            name,
            parentId,
            path: fullPath,
            documentType: documentType || 'autre',
            description,
        });
        return folder.save();
    }
    async getFolderTree(tenantId, rootFolderId) {
        const query = { tenantId, isActive: true };
        if (rootFolderId) {
            query._id = rootFolderId;
        }
        else {
            query.parentId = null;
        }
        const folders = await this.folderModel.find(query).sort({ name: 1 }).exec();
        const buildTree = async (parentId) => {
            const children = await this.folderModel
                .find({ tenantId, parentId, isActive: true })
                .sort({ name: 1 })
                .exec();
            const tree = [];
            for (const folder of children) {
                const subFolders = await buildTree(folder._id.toString());
                tree.push({
                    id: folder._id.toString(),
                    name: folder.name,
                    path: folder.path,
                    documentType: folder.documentType,
                    documentCount: folder.documentCount,
                    totalSize: folder.totalSize,
                    description: folder.description,
                    children: subFolders,
                });
            }
            return tree;
        };
        const result = [];
        for (const folder of folders) {
            const children = await buildTree(folder._id.toString());
            result.push({
                id: folder._id.toString(),
                name: folder.name,
                path: folder.path,
                documentType: folder.documentType,
                documentCount: folder.documentCount,
                totalSize: folder.totalSize,
                description: folder.description,
                children,
            });
        }
        return result;
    }
    async updateFolder(id, tenantId, updates) {
        const folder = await this.folderModel.findOne({ _id: id, tenantId }).exec();
        if (!folder) {
            throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
        }
        if (updates.name && updates.name !== folder.name) {
            const existing = await this.folderModel
                .findOne({ tenantId, parentId: folder.parentId || null, name: updates.name, _id: { $ne: id } })
                .exec();
            if (existing) {
                throw new common_1.BadRequestException(`A folder with the name "${updates.name}" already exists`);
            }
            const oldPath = folder.path;
            const newPath = folder.parentId
                ? (await this.folderModel.findById(folder.parentId).exec())?.path + '/' + updates.name
                : '/' + updates.name;
            await this.updateFolderPathRecursive(id, oldPath, newPath);
            folder.path = newPath;
        }
        if (updates.description !== undefined)
            folder.description = updates.description;
        if (updates.documentType !== undefined)
            folder.documentType = updates.documentType;
        return folder.save();
    }
    async updateFolderPathRecursive(folderId, oldPath, newPath) {
        const folder = await this.folderModel.findById(folderId).exec();
        if (!folder)
            return;
        const documents = await this.documentModel.find({ folderId }).exec();
        for (const doc of documents) {
            const newDocPath = doc.path.replace(oldPath, newPath);
            await this.documentModel.findByIdAndUpdate(doc._id, { path: newDocPath }).exec();
        }
        const subFolders = await this.folderModel.find({ parentId: folderId }).exec();
        for (const subFolder of subFolders) {
            const subOldPath = subFolder.path;
            const subNewPath = subOldPath.replace(oldPath, newPath);
            await this.folderModel.findByIdAndUpdate(subFolder._id, { path: subNewPath }).exec();
            await this.updateFolderPathRecursive(subFolder._id.toString(), subOldPath, subNewPath);
        }
    }
    async moveFolder(folderId, newParentId, tenantId) {
        const folder = await this.folderModel.findOne({ _id: folderId, tenantId }).exec();
        if (!folder) {
            throw new common_1.NotFoundException(`Folder with ID ${folderId} not found`);
        }
        if (newParentId) {
            const newParent = await this.folderModel.findOne({ _id: newParentId, tenantId }).exec();
            if (!newParent) {
                throw new common_1.NotFoundException(`Target folder with ID ${newParentId} not found`);
            }
            let currentParentId = newParentId;
            while (currentParentId) {
                if (currentParentId === folderId) {
                    throw new common_1.BadRequestException('Cannot move folder into itself or its descendants');
                }
                const currentParent = await this.folderModel.findById(currentParentId).exec();
                currentParentId = currentParent?.parentId?.toString() || null;
            }
        }
        const oldPath = folder.path;
        const newParentPath = newParentId
            ? (await this.folderModel.findById(newParentId).exec())?.path || '/'
            : '/';
        const newPath = newParentPath === '/' ? `/${folder.name}` : `${newParentPath}/${folder.name}`;
        folder.parentId = newParentId || undefined;
        folder.path = newPath;
        await folder.save();
        await this.updateFolderPathRecursive(folderId, oldPath, newPath);
        return folder;
    }
    async deleteFolder(id, tenantId, force = false) {
        const folder = await this.folderModel.findOne({ _id: id, tenantId }).exec();
        if (!folder) {
            throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
        }
        const subFolders = await this.folderModel.find({ parentId: id, tenantId }).exec();
        const documents = await this.documentModel.find({ folderId: id, tenantId }).exec();
        if ((subFolders.length > 0 || documents.length > 0) && !force) {
            throw new common_1.BadRequestException(`Folder contains ${subFolders.length} subfolder(s) and ${documents.length} document(s). Use force=true to delete anyway.`);
        }
        if (force) {
            for (const subFolder of subFolders) {
                await this.deleteFolder(subFolder._id.toString(), tenantId, true);
            }
            for (const doc of documents) {
                await this.deleteDocument(doc._id.toString(), tenantId);
            }
        }
        await this.folderModel.findByIdAndDelete(id).exec();
    }
    async uploadDocument(file, tenantId, folderId, documentType, metadata, uploadedBy) {
        let targetFolderId = folderId;
        if (!targetFolderId) {
            targetFolderId = await this.classifyDocument(file, tenantId, documentType);
        }
        if (targetFolderId) {
            const folder = await this.folderModel.findOne({ _id: targetFolderId, tenantId }).exec();
            if (!folder) {
                throw new common_1.NotFoundException(`Folder with ID ${targetFolderId} not found`);
            }
        }
        const attachment = await this.attachmentsService.upload(file, 'ged', 'document', tenantId, uploadedBy);
        const folder = targetFolderId
            ? await this.folderModel.findById(targetFolderId).exec()
            : null;
        const path = folder ? `${folder.path}/${file.originalname}` : `/${file.originalname}`;
        const document = new this.documentModel({
            tenantId,
            name: file.originalname,
            folderId: targetFolderId,
            path,
            fileName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            gridFsFileId: attachment.gridFsFileId,
            documentType: documentType || this.detectDocumentType(file.originalname, file.mimetype),
            uploadedBy,
            metadata: {
                ...metadata,
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
            },
        });
        const savedDocument = await document.save();
        if (targetFolderId) {
            await this.updateFolderDocumentCount(targetFolderId);
        }
        return savedDocument;
    }
    async classifyDocument(file, tenantId, documentType) {
        const rules = await this.ruleModel
            .find({ tenantId, isActive: true })
            .sort({ priority: -1 })
            .exec();
        const fileName = file.originalname.toLowerCase();
        const fileExtension = '.' + fileName.split('.').pop();
        for (const rule of rules) {
            if (documentType && rule.documentType !== documentType) {
                continue;
            }
            if (rule.keywords.length > 0) {
                const hasKeyword = rule.keywords.some((keyword) => fileName.includes(keyword.toLowerCase()));
                if (!hasKeyword)
                    continue;
            }
            if (rule.fileExtensions.length > 0) {
                const hasExtension = rule.fileExtensions.some((ext) => fileName.endsWith(ext.toLowerCase()));
                if (!hasExtension)
                    continue;
            }
            if (rule.conditions) {
                if (rule.conditions.minSize && file.size < rule.conditions.minSize)
                    continue;
                if (rule.conditions.maxSize && file.size > rule.conditions.maxSize)
                    continue;
            }
            return rule.targetFolderId;
        }
        return null;
    }
    detectDocumentType(fileName, mimeType) {
        const lowerName = fileName.toLowerCase();
        if (lowerName.includes('facture') || lowerName.includes('invoice'))
            return 'facture';
        if (lowerName.includes('depense') || lowerName.includes('expense'))
            return 'depense';
        if (lowerName.includes('avoir') || lowerName.includes('credit'))
            return 'avoir';
        if (lowerName.includes('devis') || lowerName.includes('quote'))
            return 'devis';
        if (lowerName.includes('contrat') || lowerName.includes('contract'))
            return 'contrat';
        if (lowerName.includes('fournisseur') || lowerName.includes('supplier'))
            return 'document_fournisseur';
        if (lowerName.includes('client') || lowerName.includes('customer'))
            return 'document_client';
        if (lowerName.includes('societe') || lowerName.includes('company'))
            return 'document_societe';
        return 'autre';
    }
    async getDocuments(tenantId, folderId, documentType, archived) {
        const query = { tenantId };
        if (folderId)
            query.folderId = folderId;
        if (documentType)
            query.documentType = documentType;
        if (archived !== undefined)
            query.archived = archived;
        return this.documentModel.find(query).sort({ createdAt: -1 }).exec();
    }
    async moveDocument(documentId, newFolderId, tenantId) {
        const document = await this.documentModel.findOne({ _id: documentId, tenantId }).exec();
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found`);
        }
        const oldFolderId = document.folderId?.toString();
        if (newFolderId) {
            const folder = await this.folderModel.findOne({ _id: newFolderId, tenantId }).exec();
            if (!folder) {
                throw new common_1.NotFoundException(`Folder with ID ${newFolderId} not found`);
            }
            document.path = `${folder.path}/${document.fileName}`;
        }
        else {
            document.path = `/${document.fileName}`;
        }
        document.folderId = newFolderId || undefined;
        await document.save();
        if (oldFolderId) {
            await this.updateFolderDocumentCount(oldFolderId);
        }
        if (newFolderId) {
            await this.updateFolderDocumentCount(newFolderId);
        }
        return document;
    }
    async deleteDocument(id, tenantId) {
        const document = await this.documentModel.findOne({ _id: id, tenantId }).exec();
        if (!document) {
            throw new common_1.NotFoundException(`Document with ID ${id} not found`);
        }
        try {
            await this.attachmentsService.delete(document.gridFsFileId, tenantId);
        }
        catch (error) {
            console.error(`Error deleting file ${document.gridFsFileId}:`, error);
        }
        const folderId = document.folderId?.toString();
        await this.documentModel.findByIdAndDelete(id).exec();
        if (folderId) {
            await this.updateFolderDocumentCount(folderId);
        }
    }
    async updateFolderDocumentCount(folderId) {
        const documents = await this.documentModel.find({ folderId }).exec();
        const documentCount = documents.length;
        const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
        await this.folderModel.findByIdAndUpdate(folderId, { documentCount, totalSize }).exec();
    }
    async createClassificationRule(tenantId, ruleData) {
        const rule = new this.ruleModel({
            tenantId,
            ...ruleData,
            priority: ruleData.priority || 0,
        });
        return rule.save();
    }
    async getClassificationRules(tenantId) {
        return this.ruleModel.find({ tenantId }).sort({ priority: -1 }).exec();
    }
    async updateClassificationRule(id, tenantId, updates) {
        const rule = await this.ruleModel.findOne({ _id: id, tenantId }).exec();
        if (!rule) {
            throw new common_1.NotFoundException(`Classification rule with ID ${id} not found`);
        }
        Object.assign(rule, updates);
        return rule.save();
    }
    async deleteClassificationRule(id, tenantId) {
        const rule = await this.ruleModel.findOne({ _id: id, tenantId }).exec();
        if (!rule) {
            throw new common_1.NotFoundException(`Classification rule with ID ${id} not found`);
        }
        await this.ruleModel.findByIdAndDelete(id).exec();
    }
};
exports.GEDService = GEDService;
exports.GEDService = GEDService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ged_folder_schema_1.GEDFolder.name)),
    __param(1, (0, mongoose_1.InjectModel)(ged_document_schema_1.GEDDocument.name)),
    __param(2, (0, mongoose_1.InjectModel)(ged_classification_rule_schema_1.GEDClassificationRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        attachments_service_1.AttachmentsService])
], GEDService);
//# sourceMappingURL=ged.service.js.map