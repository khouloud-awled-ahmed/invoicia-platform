import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankingAggregatorService } from './banking-aggregator.service';
import { EncryptionService } from './services/encryption.service';
import { UniversalDocumentParserService } from '../document-parser/services/universal-document-parser.service';
import { TenantsService } from '../tenants/tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser as CurrentUserDecorator } from '../auth/decorators/current-user.decorator';
import { GenerateConnectUrlDto } from './dto/generate-connect-url.dto';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { UpdateBankingConfigDto } from './dto/update-banking-config.dto';
import { LearnFormatDto } from './dto/learn-format.dto';
import { BankAccount, BankAccountDocument } from './schemas/bank-account.schema';
import { BankConnection, BankConnectionDocument } from './schemas/bank-connection.schema';
import {
  BankTransaction,
  BankTransactionDocument,
  BankTransactionStatus,
} from './schemas/bank-transaction.schema';

@Controller('banking')
@UseGuards(JwtAuthGuard)
export class BankingSettingsController {
  constructor(
    private readonly bankingAggregatorService: BankingAggregatorService,
    private readonly encryptionService: EncryptionService,
    private readonly documentParser: UniversalDocumentParserService,
    private readonly tenantsService: TenantsService,
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
    @InjectModel(BankConnection.name) private bankConnectionModel: Model<BankConnectionDocument>,
    @InjectModel(BankTransaction.name) private bankTransactionModel: Model<BankTransactionDocument>,
  ) {}

  /**
   * Génère l'URL de connexion OAuth pour connecter une banque
   * GET /banking/connect-url?institutionId=xxx&provider=GOCARDLESS
   */
  @Get('connect-url')
  async generateConnectUrl(
    @CurrentUserDecorator() user: any,
    @Query('institutionId') institutionId: string,
    @Query('provider') provider: string,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (!institutionId || !provider) {
      throw new BadRequestException('institutionId and provider are required');
    }

    const dto: GenerateConnectUrlDto = {
      institutionId,
      provider: provider as any,
    };

    return await this.bankingAggregatorService.generateConnectUrl(user.tenantId, dto);
  }

  /**
   * Callback OAuth : échange le code contre des tokens
   * POST /banking/callback
   */
  @Post('callback')
  async handleCallback(
    @CurrentUserDecorator() user: any,
    @Body() exchangeCodeDto: ExchangeCodeDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return await this.bankingAggregatorService.exchangeCodeForToken(user.tenantId, exchangeCodeDto);
  }

  /**
   * Synchronise les transactions depuis une connexion bancaire
   * GET /banking/connections/:connectionId/sync
   */
  @Get('connections/:connectionId/sync')
  async syncTransactions(
    @CurrentUserDecorator() user: any,
    @Param('connectionId') connectionId: string,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return await this.bankingAggregatorService.fetchRealTransactions(connectionId);
  }

  /**
   * Récupère tous les comptes bancaires du tenant
   * GET /banking/accounts
   */
  @Get('accounts')
  async getBankAccounts(@CurrentUserDecorator() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const accounts = await this.bankAccountModel.find({ tenantId: user.tenantId }).lean().exec();
    return accounts.map((a: any) => ({
      ...a,
      id: a._id?.toString(),
    }));
  }
  @Post('accounts')
  async createBankAccount(@CurrentUserDecorator() user: any, @Body() body: any) {
    if (!user.tenantId) throw new BadRequestException('Tenant ID is required');
    const account = new this.bankAccountModel({ name: body.accountName || body.name, iban: body.iban, bic: body.bic, bankName: body.bankName, tenantId: user.tenantId, provider: 'MANUAL', currency: body.currency, balance: body.balance });
    const saved = await account.save();
    return { ...saved.toObject(), id: saved._id?.toString() };
  }

  /**
   * Crée des transactions bancaires (après import relevé). Source unique = module Banque.
   * POST /banking/transactions
   */
  @Post('transactions')
  async createTransactions(
    @CurrentUserDecorator() user: any,
    @Body() body: { bankAccountId: string; transactions: Array<{ date: string; label: string; amount: number; type?: 'debit' | 'credit'; currency?: string }> },
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    if (!body.bankAccountId || !Array.isArray(body.transactions) || body.transactions.length === 0) {
      throw new BadRequestException('bankAccountId and non-empty transactions array are required');
    }

    const account = await this.bankAccountModel.findOne({
      _id: body.bankAccountId,
      tenantId: user.tenantId,
    }).exec();
    if (!account) {
      throw new BadRequestException('Compte bancaire introuvable');
    }

    const docs = body.transactions.map((tx) => ({
      tenantId: user.tenantId,
      bankAccountId: body.bankAccountId,
      date: new Date(tx.date),
      label: tx.label || '',
      amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0,
      type: tx.type || (tx.amount >= 0 ? 'credit' : 'debit'),
      currency: tx.currency || 'EUR',
      status: BankTransactionStatus.UNRECONCILED,
    }));

    const created = await this.bankTransactionModel.insertMany(docs);
    return {
      message: `${created.length} transaction(s) enregistrée(s)`,
      count: created.length,
      ids: created.map((c) => c._id.toString()),
    };
  }

  /**
   * Liste les transactions d'un compte (pour rapprochement). Filtre optionnel par statut.
   * GET /banking/transactions?bankAccountId=xxx&status=UNRECONCILED
   */
  @Get('transactions')
  async getTransactions(
    @CurrentUserDecorator() user: any,
    @Query('bankAccountId') bankAccountId: string,
    @Query('status') status?: string,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const filter: any = { tenantId: user.tenantId };
    if (bankAccountId) {
      filter.bankAccountId = bankAccountId;
    }
    if (status === 'UNRECONCILED' || status === 'RECONCILED') {
      filter.status = status;
    }

    const list = await this.bankTransactionModel.find(filter).sort({ date: -1 }).limit(500).lean().exec();
    return list.map((t: any) => ({
      id: t._id.toString(),
      bankAccountId: t.bankAccountId,
      date: t.date,
      label: t.label,
      amount: t.amount,
      type: t.type,
      currency: t.currency,
      status: t.status,
      reconciledAt: t.reconciledAt,
      targetType: t.targetType,
      targetId: t.targetId,
    }));
  }

  /**
   * Récupère toutes les connexions bancaires du tenant
   * GET /banking/connections
   */
  @Get('connections')
  async getBankConnections(@CurrentUserDecorator() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return await this.bankConnectionModel.find({ tenantId: user.tenantId }).exec();
  }

  /**
   * Récupère la liste des institutions bancaires disponibles
   * GET /banking/institutions?country=FR
   */
  @Get('institutions')
  async getInstitutions(
    @CurrentUserDecorator() user: any,
    @Query('country') country: string = 'FR',
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return await this.bankingAggregatorService.getInstitutions(country);
  }

  /**
   * Récupère la configuration bancaire du tenant (pour admin uniquement)
   * GET /banking/config
   */
  @Get('config')
  async getBankingConfig(@CurrentUserDecorator() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Accès réservé aux administrateurs');
    }

    const config = await this.tenantsService.getBankingConfig(user.tenantId);
    if (!config) {
      return { provider: null, isActive: false };
    }

    // Ne pas renvoyer les secrets, seulement l'état
    return {
      provider: config.provider,
      isActive: config.isActive,
      redirectUri: config.redirectUri,
      baseUrl: config.baseUrl,
    };
  }

  /**
   * Met à jour la configuration bancaire du tenant
   * PUT /banking/config
   */
  @Put('config')
  async updateBankingConfig(
    @CurrentUserDecorator() user: any,
    @Body() updateDto: UpdateBankingConfigDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Vérifier que l'utilisateur est admin (seulement les admins peuvent configurer)
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
      throw new BadRequestException('Seuls les administrateurs peuvent configurer le module bancaire');
    }

    // Crypter les credentials avant de les sauvegarder
    const encryptedConfig = {
      provider: updateDto.provider,
      clientId: this.encryptionService.encrypt(updateDto.clientId),
      clientSecret: this.encryptionService.encrypt(updateDto.clientSecret),
      isActive: updateDto.isActive !== undefined ? updateDto.isActive : true,
      redirectUri: updateDto.redirectUri,
      baseUrl: updateDto.baseUrl,
    };

    await this.tenantsService.updateBankingConfig(user.tenantId, encryptedConfig);

    return {
      message: 'Configuration bancaire mise à jour avec succès',
      provider: updateDto.provider,
      isActive: encryptedConfig.isActive,
    };
  }

  /**
   * Upload et analyse un fichier bancaire
   * POST /banking/import/analyze
   */
  @Post('import/analyze')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeBankFile(
    @CurrentUserDecorator() user: any,
    @UploadedFile() file: any, // Express.Multer.File
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    return await this.documentParser.analyze(file, 'BANK', user.tenantId);
  }

  /**
   * Apprend un nouveau format de fichier bancaire
   * POST /banking/import/learn
   */
  @Post('import/learn')
  async learnFormat(
    @CurrentUserDecorator() user: any,
    @Body() learnFormatDto: LearnFormatDto,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const template = await this.documentParser.learnFormat(
      user.tenantId,
      {
        ...learnFormatDto,
        type: 'BANK', // Forcer le type BANK pour les imports bancaires
      },
    );

    return {
      message: 'Format appris avec succès',
      template: {
        id: template._id.toString(),
        name: template.name,
        signature: template.signature,
      },
    };
  }

  /**
   * Liste tous les formats appris
   * GET /banking/import/templates
   */
  @Get('import/templates')
  async getTemplates(@CurrentUserDecorator() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const templates = await this.documentParser.getTemplates(user.tenantId, 'BANK');
    return templates.map(t => ({
      id: t._id.toString(),
      name: t.name,
      signature: t.signature,
      fileType: t.fileType,
      createdAt: (t as any).createdAt || new Date(),
    }));
  }

  /**
   * Supprime un template
   * DELETE /banking/import/templates/:id
   */
  @Delete('import/templates/:id')
  async deleteTemplate(
    @CurrentUserDecorator() user: any,
    @Param('id') templateId: string,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    await this.documentParser.deleteTemplate(templateId, user.tenantId);
    return { message: 'Template supprimé avec succès' };
  }
}
