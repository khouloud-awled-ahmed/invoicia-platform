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
  Req,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { EnvelopesService } from './envelopes.service';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { UpdateEnvelopeDto } from './dto/update-envelope.dto';
import { CreateFieldDto } from './dto/create-field.dto';
import { SignEnvelopeDto } from './dto/sign-envelope.dto';
import { RefuseEnvelopeDto } from './dto/refuse-envelope.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('envelopes')
export class EnvelopesController {
  constructor(private readonly envelopesService: EnvelopesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createEnvelopeDto: CreateEnvelopeDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.envelopesService.create(
      createEnvelopeDto,
      user.id || user._id,
      user.tenantId || req.user?.tenantId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @CurrentUser() user: any,
    @Req() req: any,
    @Query('status') status?: string,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    return this.envelopesService.findAll(tenantId, status ? { status: status as any } : undefined);
  }

  @Get('my-signatures')
  // Pas de @UseGuards() pour permettre l'accès public via email
  async findMySignatures(@Query('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    return this.envelopesService.findByRecipientEmail(email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    return this.envelopesService.findOne(id, tenantId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEnvelopeDto: UpdateEnvelopeDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    return this.envelopesService.update(id, updateEnvelopeDto, tenantId);
  }

  @Post(':id/fields')
  @UseGuards(JwtAuthGuard)
  async addFields(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    const fields = Array.isArray(body) ? body : (body.fields || []);
    return this.envelopesService.addFields(id, fields, tenantId);
  }

  @Post(':id/send')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async send(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    return this.envelopesService.send(id, tenantId, ipAddress);
  }

  @Post(':id/sign')
  @HttpCode(HttpStatus.OK)
  // Pas de @UseGuards() pour permettre la signature publique via email
  async sign(
    @Param('id') id: string,
    @Body() signDto: SignEnvelopeDto,
    @Query('email') email: string,
    @Req() req: any,
  ) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.envelopesService.sign(id, signDto, email, ipAddress, userAgent);
  }

  @Post(':id/refuse')
  @HttpCode(HttpStatus.OK)
  // Pas de @UseGuards() pour permettre le refus public via email
  async refuse(
    @Param('id') id: string,
    @Body() refuseDto: RefuseEnvelopeDto,
    @Query('email') email: string,
    @Req() req: any,
  ) {
    if (!email) {
      throw new BadRequestException('Email query parameter is required');
    }
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.envelopesService.refuse(id, refuseDto, email, ipAddress, userAgent);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadSignedDocument(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    const filePath = await this.envelopesService.getSignedDocumentPath(id, tenantId);
    
    if (!filePath) {
      throw new NotFoundException('Document signé non trouvé');
    }

    const path = require('path');
    const fileName = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  }

  @Get(':id/download-certificate')
  @UseGuards(JwtAuthGuard)
  async downloadCertificate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    const filePath = await this.envelopesService.getCertificatePath(id, tenantId);
    
    if (!filePath) {
      throw new NotFoundException('Certificat non trouvé');
    }

    const path = require('path');
    const fileName = path.basename(filePath);
    res.setHeader('Content-Disposition', `attachment; filename="certificat-${id}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(filePath);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const tenantId = user.tenantId || req.user?.tenantId;
    await this.envelopesService.remove(id, tenantId);
  }
}





