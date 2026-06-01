import { Controller, Req, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Logger, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UniversalDocumentParserService } from '../document-parser/services/universal-document-parser.service';
import { ChatbotService } from './chatbot.service';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  private readonly logger = new Logger(EmployeesController.name);

  constructor(
    private readonly employeesService: EmployeesService,
    private readonly documentParser: UniversalDocumentParserService,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Post()
  async create(@Body() createDto: any, @CurrentUser() user: any) {
    try {
      if (!createDto.firstName || !createDto.lastName || !createDto.email) {
        throw new BadRequestException('Les champs Prénom, Nom et Email sont obligatoires');
      }
      if (!user.tenantId) {
        throw new BadRequestException('Tenant ID requis');
      }
      return await this.employeesService.create(createDto, user.tenantId);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      if (error.code === 11000) {
        throw new BadRequestException('Cet email est déjà utilisé. Veuillez en choisir un autre.');
      }
      throw new BadRequestException(error.message || 'Erreur lors de la création du collaborateur');
    }
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    try {
      if (!user.tenantId) throw new BadRequestException('Tenant ID requis');
      return await this.employeesService.findAll(user.tenantId);
    } catch (error) {
      throw new BadRequestException(error.message || 'Erreur lors de la récupération des employés');
    }
  }

  @Get('cvs')
  async getCVs(@CurrentUser() user: any) {
    if (!user.tenantId) throw new BadRequestException('Tenant ID requis');
    return await this.employeesService.findAllCVs(user.tenantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.employeesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: any, @CurrentUser() user: any) {
    return await this.employeesService.update(id, updateDto, user.tenantId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.employeesService.remove(id, user.tenantId);
  }

  @Post('upload-cv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCV(@UploadedFile() file: any, @CurrentUser() user: any) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    if (!user.tenantId) throw new BadRequestException('Tenant ID requis');

    try {
      const result = await this.documentParser.analyze(file, 'CV', user.tenantId);

// Accept CV even if format unknown - extract from rawText
const rawTextFallback = result.rawText || '';
const emailFallback = rawTextFallback.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/)?.[1];
const nameFallback = rawTextFallback.split('\n').slice(0,3).filter(l => l.trim().length > 2 && l.trim().length < 60).join(' ').trim().substring(0, 60);
if (result.status === 'LEARNING_NEEDED') {
  const saved = await this.employeesService.createCV(user.tenantId, {
    fileName: file.originalname || 'document',
    name: nameFallback || undefined,
    email: emailFallback || undefined,
    rawText: rawTextFallback,
  });
  const nameParts = (saved.name || '').trim().split(/\s+/);
  return {
    id: saved._id.toString(),
    fileName: saved.fileName,
    name: saved.name,
    email: saved.email,
    rawText: saved.rawText?.substring(0, 500),
    createdAt: (saved as any).createdAt,
    extractedData: {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: emailFallback || '',
      phone: rawTextFallback.match(/(?:\+216|0)[0-9\s]{8,}/)?.[0]?.trim() || '',
      title: '',
      summary: '',
      yearsOfExperience: 0,
      city: '',
      skills: [],
      experiences: [],
      education: [],
      certifications: [],
      languages: [],
    },
  };
}

if (result.status !== 'SUCCESS' || !result.data) {
  throw new BadRequestException('Impossible de lire le contenu du fichier.');
}      const data = result.data as {
        firstName?: string;
        lastName?: string;
        email?: string;
        rawText?: string;
        [key: string]: unknown;
      };

      this.logger.log('CV AI data: ' + JSON.stringify(data));
      const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined;
      const rawText = typeof data.rawText === 'string' ? data.rawText : result.rawText || '';
      // Extract email from rawText if not found by AI
      const emailFromText = rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/)?.[1];
      const finalEmail = data.email || emailFromText || undefined;
      // Extract name from rawText if not found by AI  
      const nameFromText = rawText.split('\n').slice(0,3).join(' ').trim().substring(0,50);
      const finalName = name || nameFromText || undefined;

      const saved = await this.employeesService.createCV(user.tenantId, {
        fileName: file.originalname || 'document',
        name: finalName,
        email: finalEmail,
        rawText,
      });

      const nameParts = (saved.name || '').trim().split(/\s+/);
      return {
        id: saved._id.toString(),
        fileName: saved.fileName,
        name: saved.name,
        email: saved.email,
        rawText: saved.rawText?.substring(0, 500),
        createdAt: (saved as any).createdAt,
        extractedData: {
          firstName: (data as any).firstName || nameParts[0] || '',
          lastName: (data as any).lastName || nameParts.slice(1).join(' ') || '',
          email: finalEmail || '',
          phone: (data as any).phone || rawText.match(/(?:\+216|0)[0-9]{8}/)?.[0] || '',
          title: (data as any).title || '',
          summary: (data as any).summary || '',
          yearsOfExperience: 0,
          city: '',
          skills: (data as any).skills?.map((s: string) => ({ name: s, category: 'Technique', level: 3, years: 1 })) || [],
          experiences: (data as any).experiences || [],
          education: (data as any).education || [],
          certifications: [],
          languages: [],
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(error.message || 'Erreur upload CV');
    }
  }

  @Post('chatbot')
  async chatbot(@Body() body: { question: string }, @CurrentUser() user: any) {
    if (!user.tenantId) throw new BadRequestException('Tenant ID requis');
    const answer = await this.chatbotService.chat(body.question, user.tenantId);
    return { answer };
  }
}

