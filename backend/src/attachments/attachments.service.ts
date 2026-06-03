import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';
import { GridFSBucket, ObjectId } from 'mongodb';

@Injectable()
export class AttachmentsService {
  private gridFSBucket: GridFSBucket;

  constructor(
    @InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>,
    @InjectConnection() private connection: Connection,
  ) {
    // Initialiser GridFS bucket (lazy initialization car la connexion peut ne pas être prête)
    this.initGridFS();
  }

  private initGridFS() {
    try {
      if (this.connection.readyState === 1) {
        this.gridFSBucket = new GridFSBucket(this.connection.db, {
          bucketName: 'attachments',
        });
      } else {
        // Retry après un court délai si la connexion n'est pas prête
        setTimeout(() => this.initGridFS(), 100);
      }
    } catch (error) {
      console.error('Error initializing GridFS:', error);
    }
  }

  private getGridFSBucket(): GridFSBucket {
    if (!this.gridFSBucket) {
      this.gridFSBucket = new GridFSBucket(this.connection.db, {
        bucketName: 'attachments',
      });
    }
    return this.gridFSBucket;
  }

  async upload(
    file: any,
    entityType: string,
    entityId: string,
    tenantId: string,
    uploadedBy?: string,
  ): Promise<Attachment> {
    // Validation du type de fichier
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
      throw new BadRequestException('Type de fichier non autorisé');
    }

    // Validation de la taille (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux (max 10MB)');
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const randomString = new ObjectId().toString().substring(0, 8);
    const fileExtension = file.originalname.split('.').pop();
    const uniqueFileName = `${entityType}/${entityId}/${timestamp}-${randomString}.${fileExtension}`;

    // Upload vers GridFS
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
          // Créer l'entrée dans la collection attachments
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
        } catch (error) {
          // Si l'enregistrement échoue, supprimer le fichier de GridFS
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

  async findAll(entityType: string, entityId: string, tenantId: string): Promise<Attachment[]> {
    return this.attachmentModel
      .find({ tenantId, entityType, entityId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string, tenantId: string): Promise<Attachment> {
    const query: any = tenantId ? { _id: id, tenantId } : { _id: id };
    const attachment = await this.attachmentModel.findOne(query).exec();
    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }
    return attachment;
  }

  async getFileStream(
    attachmentId: string,
    tenantId: string,
  ): Promise<{ stream: NodeJS.ReadableStream; attachment: Attachment }> {
    const attachment = await this.findOne(attachmentId, tenantId);
    const fileId = new ObjectId(attachment.gridFsFileId);
    const bucket = this.getGridFSBucket();

    // Vérifier que le fichier existe dans GridFS
    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      throw new NotFoundException('File not found in storage');
    }

    const downloadStream = bucket.openDownloadStream(fileId);
    return { stream: downloadStream, attachment };
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const attachment = await this.findOne(id, tenantId);
    const fileId = new ObjectId(attachment.gridFsFileId);
    const bucket = this.getGridFSBucket();

    // Supprimer le fichier de GridFS
    await bucket.delete(fileId);

    // Supprimer l'entrée de la collection
    const attachmentId = (attachment as any)._id;
    await this.attachmentModel.findByIdAndDelete(attachmentId).exec();
  }

  async deleteByEntity(entityType: string, entityId: string, tenantId: string): Promise<void> {
    const attachments = await this.findAll(entityType, entityId, tenantId);
    const bucket = this.getGridFSBucket();

    for (const attachment of attachments) {
      try {
        const fileId = new ObjectId(attachment.gridFsFileId);
        await bucket.delete(fileId);
      } catch (error) {
        // Continuer même si la suppression du fichier échoue
        console.error(`Error deleting file ${attachment.gridFsFileId}:`, error);
      }
    }

    await this.attachmentModel.deleteMany({ tenantId, entityType, entityId }).exec();
  }
}
