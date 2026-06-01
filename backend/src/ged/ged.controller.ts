import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GEDService } from './ged.service';
import { GEDInitializationService } from './ged-initialization.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { CreateClassificationRuleDto } from './dto/create-classification-rule.dto';

@Controller('ged')
@UseGuards(JwtAuthGuard)
export class GEDController {
  constructor(
    private readonly gedService: GEDService,
    private readonly initializationService: GEDInitializationService,
  ) {}

  // ==================== DOSSIERS ====================

  @Post('folders')
  async createFolder(@Body() createFolderDto: CreateFolderDto, @CurrentUser() user: any) {
    return this.gedService.createFolder(
      user.tenantId,
      createFolderDto.name,
      createFolderDto.parentId,
      createFolderDto.documentType,
      createFolderDto.description,
    );
  }

  @Get('folders/tree')
  async getFolderTree(@CurrentUser() user: any, @Query('rootFolderId') rootFolderId?: string) {
    return this.gedService.getFolderTree(user.tenantId, rootFolderId);
  }

  @Get('folders/:id')
  async getFolder(@Param('id') id: string, @CurrentUser() user: any) {
    // TODO: Implémenter getFolder si nécessaire
    return { id, message: 'Folder details endpoint' };
  }

  @Patch('folders/:id')
  async updateFolder(
    @Param('id') id: string,
    @Body() updates: { name?: string; description?: string; documentType?: string },
    @CurrentUser() user: any,
  ) {
    return this.gedService.updateFolder(id, user.tenantId, updates);
  }

  @Put('folders/:id/move')
  async moveFolder(
    @Param('id') id: string,
    @Body() body: { newParentId: string | null },
    @CurrentUser() user: any,
  ) {
    return this.gedService.moveFolder(id, body.newParentId, user.tenantId);
  }

  @Delete('folders/:id')
  async deleteFolder(
    @Param('id') id: string,
    @Query('force') force: string,
    @CurrentUser() user: any,
  ) {
    return this.gedService.deleteFolder(id, user.tenantId, force === 'true');
  }

  // ==================== DOCUMENTS ====================

  @Post('documents/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: any,
    @Query('folderId') folderId: string,
    @Query('documentType') documentType: string,
    @Body() metadata: any,
    @CurrentUser() user: any,
  ) {
    return this.gedService.uploadDocument(
      file,
      user.tenantId,
      folderId,
      documentType,
      metadata,
      user.userId,
    );
  }

  @Get('documents')
  async getDocuments(
    @Query('folderId') folderId: string,
    @Query('documentType') documentType: string,
    @Query('archived') archived: string,
    @CurrentUser() user: any,
  ) {
    return this.gedService.getDocuments(
      user.tenantId,
      folderId,
      documentType,
      archived === 'true' ? true : archived === 'false' ? false : undefined,
    );
  }

  @Put('documents/:id/move')
  async moveDocument(
    @Param('id') id: string,
    @Body() body: { newFolderId: string | null },
    @CurrentUser() user: any,
  ) {
    return this.gedService.moveDocument(id, body.newFolderId, user.tenantId);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gedService.deleteDocument(id, user.tenantId);
  }

  // ==================== RÈGLES DE CLASSEMENT ====================

  @Post('classification-rules')
  async createClassificationRule(
    @Body() createRuleDto: CreateClassificationRuleDto,
    @CurrentUser() user: any,
  ) {
    return this.gedService.createClassificationRule(user.tenantId, createRuleDto);
  }

  @Get('classification-rules')
  async getClassificationRules(@CurrentUser() user: any) {
    return this.gedService.getClassificationRules(user.tenantId);
  }

  @Patch('classification-rules/:id')
  async updateClassificationRule(
    @Param('id') id: string,
    @Body() updates: Partial<CreateClassificationRuleDto>,
    @CurrentUser() user: any,
  ) {
    return this.gedService.updateClassificationRule(id, user.tenantId, updates);
  }

  @Delete('classification-rules/:id')
  async deleteClassificationRule(@Param('id') id: string, @CurrentUser() user: any) {
    return this.gedService.deleteClassificationRule(id, user.tenantId);
  }

  // ==================== INITIALISATION ====================

  @Post('initialize')
  async initializeStructure(@CurrentUser() user: any) {
    await this.initializationService.initializeDefaultStructure(user.tenantId);
    return { message: 'GED structure initialized successfully' };
  }
}
