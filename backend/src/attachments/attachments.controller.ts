import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  ParseEnumPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Query('entityType', new ParseEnumPipe(['invoice', 'purchase_invoice', 'credit_note', 'tenant_logo'])) entityType: string,
    @Query('entityId') entityId: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!entityId) throw new BadRequestException('entityId is required');
    if (!file.buffer) throw new BadRequestException('File buffer is missing');
    const attachment = await this.attachmentsService.upload(
      file, entityType, entityId, user.tenantId, user.email || user.userId,
    );
    return {
      success: true,
      data: {
        id: (attachment as any)._id?.toString(),
        entityType: attachment.entityType,
        entityId: attachment.entityId,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        fileType: attachment.fileType,
        uploadedAt: (attachment as any).createdAt || new Date(),
        uploadedBy: attachment.uploadedBy,
      },
    };
  }

  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const { stream, attachment } = await this.attachmentsService.getFileStream(id, null);
    res.setHeader('Content-Type', attachment.fileType);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':entityType/:entityId')
  async findAll(
    @Param('entityType', new ParseEnumPipe(['invoice', 'purchase_invoice', 'credit_note'])) entityType: string,
    @Param('entityId') entityId: string,
    @CurrentUser() user: any,
  ) {
    const attachments = await this.attachmentsService.findAll(entityType, entityId, user.tenantId);
    const attachmentsWithUrls = attachments.map((att) => ({
      id: (att as any)._id?.toString(),
      entityType: att.entityType,
      entityId: att.entityId,
      fileName: att.fileName,
      fileSize: att.fileSize,
      fileType: att.fileType,
      fileUrl: `/api/attachments/download/${(att as any)._id?.toString()}`,
      uploadedAt: (att as any).createdAt || new Date(),
      uploadedBy: att.uploadedBy,
    }));
    return { success: true, data: attachmentsWithUrls };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    await this.attachmentsService.delete(id, user.tenantId);
    return { success: true, message: 'Attachment deleted successfully' };
  }
}
