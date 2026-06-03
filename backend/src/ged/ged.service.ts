import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GEDFolder, GEDFolderDocument } from './schemas/ged-folder.schema';
import { GEDDocument, GEDDocumentDocument } from './schemas/ged-document.schema';
import {
  GEDClassificationRule,
  GEDClassificationRuleDocument,
} from './schemas/ged-classification-rule.schema';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class GEDService {
  constructor(
    @InjectModel(GEDFolder.name) private folderModel: Model<GEDFolderDocument>,
    @InjectModel(GEDDocument.name) private documentModel: Model<GEDDocumentDocument>,
    @InjectModel(GEDClassificationRule.name)
    private ruleModel: Model<GEDClassificationRuleDocument>,
    private attachmentsService: AttachmentsService,
  ) {}

  // ==================== GESTION DES DOSSIERS ====================

  async createFolder(
    tenantId: string,
    name: string,
    parentId?: string,
    documentType?: string,
    description?: string,
  ): Promise<GEDFolder> {
    // Vérifier que le dossier parent existe si parentId est fourni
    let parentPath = '/';
    if (parentId) {
      const parent = await this.folderModel.findOne({ _id: parentId, tenantId }).exec();
      if (!parent) {
        throw new NotFoundException(`Parent folder with ID ${parentId} not found`);
      }
      parentPath = parent.path;
    }

    // Construire le chemin complet
    const fullPath = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

    // Vérifier qu'un dossier avec le même nom n'existe pas dans le même parent
    const existingFolder = await this.folderModel
      .findOne({ tenantId, parentId: parentId || null, name })
      .exec();
    if (existingFolder) {
      throw new BadRequestException(
        `A folder with the name "${name}" already exists in this location`,
      );
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

  async getFolderTree(tenantId: string, rootFolderId?: string): Promise<any[]> {
    const query: any = { tenantId, isActive: true };
    if (rootFolderId) {
      query._id = rootFolderId;
    } else {
      query.parentId = null;
    }

    const folders = await this.folderModel.find(query).sort({ name: 1 }).exec();

    const buildTree = async (parentId: string | null): Promise<any[]> => {
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

  async updateFolder(
    id: string,
    tenantId: string,
    updates: { name?: string; description?: string; documentType?: string },
  ): Promise<GEDFolder> {
    const folder = await this.folderModel.findOne({ _id: id, tenantId }).exec();
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    if (updates.name && updates.name !== folder.name) {
      // Vérifier qu'un autre dossier avec ce nom n'existe pas dans le même parent
      const existing = await this.folderModel
        .findOne({
          tenantId,
          parentId: folder.parentId || null,
          name: updates.name,
          _id: { $ne: id },
        })
        .exec();
      if (existing) {
        throw new BadRequestException(`A folder with the name "${updates.name}" already exists`);
      }

      // Mettre à jour le chemin et tous les chemins des sous-dossiers
      const oldPath = folder.path;
      const newPath = folder.parentId
        ? (await this.folderModel.findById(folder.parentId).exec())?.path + '/' + updates.name
        : '/' + updates.name;

      await this.updateFolderPathRecursive(id, oldPath, newPath);
      folder.path = newPath;
    }

    if (updates.description !== undefined) folder.description = updates.description;
    if (updates.documentType !== undefined) folder.documentType = updates.documentType;

    return folder.save();
  }

  private async updateFolderPathRecursive(
    folderId: string,
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const folder = await this.folderModel.findById(folderId).exec();
    if (!folder) return;

    // Mettre à jour les chemins des documents dans ce dossier
    const documents = await this.documentModel.find({ folderId }).exec();
    for (const doc of documents) {
      const newDocPath = doc.path.replace(oldPath, newPath);
      await this.documentModel.findByIdAndUpdate(doc._id, { path: newDocPath }).exec();
    }

    // Mettre à jour les sous-dossiers
    const subFolders = await this.folderModel.find({ parentId: folderId }).exec();
    for (const subFolder of subFolders) {
      const subOldPath = subFolder.path;
      const subNewPath = subOldPath.replace(oldPath, newPath);
      await this.folderModel.findByIdAndUpdate(subFolder._id, { path: subNewPath }).exec();
      await this.updateFolderPathRecursive(subFolder._id.toString(), subOldPath, subNewPath);
    }
  }

  async moveFolder(
    folderId: string,
    newParentId: string | null,
    tenantId: string,
  ): Promise<GEDFolder> {
    const folder = await this.folderModel.findOne({ _id: folderId, tenantId }).exec();
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    // Vérifier qu'on ne déplace pas un dossier dans lui-même ou ses descendants
    if (newParentId) {
      const newParent = await this.folderModel.findOne({ _id: newParentId, tenantId }).exec();
      if (!newParent) {
        throw new NotFoundException(`Target folder with ID ${newParentId} not found`);
      }

      // Vérifier qu'on ne crée pas de boucle
      let currentParentId: string | null = newParentId;
      while (currentParentId) {
        if (currentParentId === folderId) {
          throw new BadRequestException('Cannot move folder into itself or its descendants');
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

    // Mettre à jour récursivement tous les chemins des sous-dossiers et documents
    await this.updateFolderPathRecursive(folderId, oldPath, newPath);

    return folder;
  }

  async deleteFolder(id: string, tenantId: string, force: boolean = false): Promise<void> {
    const folder = await this.folderModel.findOne({ _id: id, tenantId }).exec();
    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    // Vérifier s'il y a des sous-dossiers ou documents
    const subFolders = await this.folderModel.find({ parentId: id, tenantId }).exec();
    const documents = await this.documentModel.find({ folderId: id, tenantId }).exec();

    if ((subFolders.length > 0 || documents.length > 0) && !force) {
      throw new BadRequestException(
        `Folder contains ${subFolders.length} subfolder(s) and ${documents.length} document(s). Use force=true to delete anyway.`,
      );
    }

    // Supprimer récursivement les sous-dossiers si force=true
    if (force) {
      for (const subFolder of subFolders) {
        await this.deleteFolder(subFolder._id.toString(), tenantId, true);
      }

      // Supprimer tous les documents
      for (const doc of documents) {
        await this.deleteDocument(doc._id.toString(), tenantId);
      }
    }

    await this.folderModel.findByIdAndDelete(id).exec();
  }

  // ==================== GESTION DES DOCUMENTS ====================

  async uploadDocument(
    file: any,
    tenantId: string,
    folderId?: string,
    documentType?: string,
    metadata?: any,
    uploadedBy?: string,
  ): Promise<GEDDocument> {
    // Déterminer le dossier cible selon les règles de classement
    let targetFolderId = folderId;
    if (!targetFolderId) {
      targetFolderId = await this.classifyDocument(file, tenantId, documentType);
    }

    // Vérifier que le dossier existe
    if (targetFolderId) {
      const folder = await this.folderModel.findOne({ _id: targetFolderId, tenantId }).exec();
      if (!folder) {
        throw new NotFoundException(`Folder with ID ${targetFolderId} not found`);
      }
    }

    // Uploader le fichier via AttachmentsService
    const attachment = await this.attachmentsService.upload(
      file,
      'ged',
      'document',
      tenantId,
      uploadedBy,
    );

    // Construire le chemin
    const folder = targetFolderId ? await this.folderModel.findById(targetFolderId).exec() : null;
    const path = folder ? `${folder.path}/${file.originalname}` : `/${file.originalname}`;

    // Créer le document GED
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

    // Mettre à jour le compteur du dossier
    if (targetFolderId) {
      await this.updateFolderDocumentCount(targetFolderId);
    }

    return savedDocument;
  }

  private async classifyDocument(
    file: any,
    tenantId: string,
    documentType?: string,
  ): Promise<string | null> {
    // Récupérer les règles de classement actives
    const rules = await this.ruleModel
      .find({ tenantId, isActive: true })
      .sort({ priority: -1 })
      .exec();

    const fileName = file.originalname.toLowerCase();
    const fileExtension = '.' + fileName.split('.').pop();

    for (const rule of rules) {
      // Vérifier le type de document
      if (documentType && rule.documentType !== documentType) {
        continue;
      }

      // Vérifier les mots-clés
      if (rule.keywords.length > 0) {
        const hasKeyword = rule.keywords.some((keyword) =>
          fileName.includes(keyword.toLowerCase()),
        );
        if (!hasKeyword) continue;
      }

      // Vérifier les extensions
      if (rule.fileExtensions.length > 0) {
        const hasExtension = rule.fileExtensions.some((ext) =>
          fileName.endsWith(ext.toLowerCase()),
        );
        if (!hasExtension) continue;
      }

      // Vérifier les conditions
      if (rule.conditions) {
        if (rule.conditions.minSize && file.size < rule.conditions.minSize) continue;
        if (rule.conditions.maxSize && file.size > rule.conditions.maxSize) continue;
      }

      return rule.targetFolderId;
    }

    return null;
  }

  private detectDocumentType(fileName: string, mimeType: string): string {
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('facture') || lowerName.includes('invoice')) return 'facture';
    if (lowerName.includes('depense') || lowerName.includes('expense')) return 'depense';
    if (lowerName.includes('avoir') || lowerName.includes('credit')) return 'avoir';
    if (lowerName.includes('devis') || lowerName.includes('quote')) return 'devis';
    if (lowerName.includes('contrat') || lowerName.includes('contract')) return 'contrat';
    if (lowerName.includes('fournisseur') || lowerName.includes('supplier'))
      return 'document_fournisseur';
    if (lowerName.includes('client') || lowerName.includes('customer')) return 'document_client';
    if (lowerName.includes('societe') || lowerName.includes('company')) return 'document_societe';

    return 'autre';
  }

  async getDocuments(
    tenantId: string,
    folderId?: string,
    documentType?: string,
    archived?: boolean,
  ): Promise<GEDDocument[]> {
    const query: any = { tenantId };
    if (folderId) query.folderId = folderId;
    if (documentType) query.documentType = documentType;
    if (archived !== undefined) query.archived = archived;

    return this.documentModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async moveDocument(
    documentId: string,
    newFolderId: string | null,
    tenantId: string,
  ): Promise<GEDDocument> {
    const document = await this.documentModel.findOne({ _id: documentId, tenantId }).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const oldFolderId = document.folderId?.toString();

    // Vérifier que le nouveau dossier existe
    if (newFolderId) {
      const folder = await this.folderModel.findOne({ _id: newFolderId, tenantId }).exec();
      if (!folder) {
        throw new NotFoundException(`Folder with ID ${newFolderId} not found`);
      }
      document.path = `${folder.path}/${document.fileName}`;
    } else {
      document.path = `/${document.fileName}`;
    }

    document.folderId = newFolderId || undefined;
    await document.save();

    // Mettre à jour les compteurs des dossiers
    if (oldFolderId) {
      await this.updateFolderDocumentCount(oldFolderId);
    }
    if (newFolderId) {
      await this.updateFolderDocumentCount(newFolderId);
    }

    return document;
  }

  async deleteDocument(id: string, tenantId: string): Promise<void> {
    const document = await this.documentModel.findOne({ _id: id, tenantId }).exec();
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Supprimer le fichier via AttachmentsService (utiliser gridFsFileId)
    try {
      await this.attachmentsService.delete(document.gridFsFileId, tenantId);
    } catch (error) {
      // Continuer même si la suppression du fichier échoue
      console.error(`Error deleting file ${document.gridFsFileId}:`, error);
    }

    // Supprimer le document
    const folderId = document.folderId?.toString();
    await this.documentModel.findByIdAndDelete(id).exec();

    // Mettre à jour le compteur du dossier
    if (folderId) {
      await this.updateFolderDocumentCount(folderId);
    }
  }

  private async updateFolderDocumentCount(folderId: string): Promise<void> {
    const documents = await this.documentModel.find({ folderId }).exec();
    const documentCount = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

    await this.folderModel.findByIdAndUpdate(folderId, { documentCount, totalSize }).exec();
  }

  // ==================== RÈGLES DE CLASSEMENT ====================

  async createClassificationRule(
    tenantId: string,
    ruleData: {
      name: string;
      documentType: string;
      targetFolderId: string;
      keywords?: string[];
      fileExtensions?: string[];
      conditions?: any;
      priority?: number;
    },
  ): Promise<GEDClassificationRule> {
    const rule = new this.ruleModel({
      tenantId,
      ...ruleData,
      priority: ruleData.priority || 0,
    });

    return rule.save();
  }

  async getClassificationRules(tenantId: string): Promise<GEDClassificationRule[]> {
    return this.ruleModel.find({ tenantId }).sort({ priority: -1 }).exec();
  }

  async updateClassificationRule(
    id: string,
    tenantId: string,
    updates: Partial<GEDClassificationRule>,
  ): Promise<GEDClassificationRule> {
    const rule = await this.ruleModel.findOne({ _id: id, tenantId }).exec();
    if (!rule) {
      throw new NotFoundException(`Classification rule with ID ${id} not found`);
    }

    Object.assign(rule, updates);
    return rule.save();
  }

  async deleteClassificationRule(id: string, tenantId: string): Promise<void> {
    const rule = await this.ruleModel.findOne({ _id: id, tenantId }).exec();
    if (!rule) {
      throw new NotFoundException(`Classification rule with ID ${id} not found`);
    }

    await this.ruleModel.findByIdAndDelete(id).exec();
  }
}
