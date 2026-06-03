import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UniversalDocumentParserService } from './services/universal-document-parser.service';
import { LearnFormatDto } from './dto/learn-format.dto';
import { DocumentType } from './schemas/parsing-template.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('document-parser')
@UseGuards(JwtAuthGuard)
export class DocumentParserController {
  constructor(private readonly parserService: UniversalDocumentParserService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyze(@UploadedFile() file: any, @Query('type') type: string, @CurrentUser() user: any) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    if (!type || !['BANK', 'INVOICE', 'CV'].includes(type))
      throw new BadRequestException('Type invalide');
    return await this.parserService.analyze(file, type as DocumentType, user.tenantId);
  }

  @Post('ai-scan')
  @UseInterceptors(FileInterceptor('file'))
  async aiScan(@UploadedFile() file: any, @CurrentUser() user: any) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new BadRequestException('ANTHROPIC_API_KEY manquant');
    const base64 = file.buffer.toString('base64');
    const mimeType = file.mimetype || 'application/pdf';
    const isImage = mimeType.startsWith('image/');
    const content: any[] = [
      isImage
        ? { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } }
        : {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
      {
        type: 'text',
        text: 'Analyse cette facture et retourne UNIQUEMENT un JSON: {"invoiceNumber":"","date":"YYYY-MM-DD","dueDate":"YYYY-MM-DD","clientName":"","clientAddress":"","clientEmail":"","totalHT":0,"totalTVA":0,"totalTTC":0,"currency":"TND","items":[{"description":"","quantity":1,"unitPrice":0,"vatRate":19}]}. JSON uniquement sans markdown.',
      },
    ];
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content }],
      }),
    });
    if (!res.ok) throw new BadRequestException('Erreur API Claude');
    const data = await res.json();
    const text = data.content[0].text;
    try {
      return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      return { rawText: text };
    }
  }

  @Post('learn')
  async learnFormat(@Query('templateName') templateName: string, @CurrentUser() user: any) {
    return { message: 'ok' };
  }

  @Get('templates')
  async getTemplates(@Query('type') type: string, @CurrentUser() user: any) {
    return await this.parserService.getTemplates(user.tenantId, type as DocumentType);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.parserService.deleteTemplate(id, user.tenantId);
  }
}
