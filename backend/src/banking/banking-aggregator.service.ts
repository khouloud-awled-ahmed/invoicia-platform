import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { BankConnection, BankConnectionDocument, BankingProvider } from './schemas/bank-connection.schema';
import { BankAccount, BankAccountDocument } from './schemas/bank-account.schema';
import { GenerateConnectUrlDto } from './dto/generate-connect-url.dto';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { TenantsService } from '../tenants/tenants.service';
import { EncryptionService } from './services/encryption.service';

@Injectable()
export class BankingAggregatorService {
  private readonly logger = new Logger(BankingAggregatorService.name);

  constructor(
    @InjectModel(BankConnection.name) private bankConnectionModel: Model<BankConnectionDocument>,
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
    private configService: ConfigService,
    private tenantsService: TenantsService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * Vérifie si le service bancaire est actif (clés dans .env ou config tenant)
   */
  private async isBankingServiceActive(tenantId: string, provider: BankingProvider): Promise<boolean> {
    // Mode SaaS Global : Vérifier d'abord les clés dans .env
    // Support des deux formats: GOCARDLESS_CLIENT_ID ou GOCARDLESS_SECRET_ID
    const envClientId = this.configService.get<string>(`${provider}_CLIENT_ID`) || 
                       this.configService.get<string>(`${provider}_SECRET_ID`);
    const envClientSecret = this.configService.get<string>(`${provider}_CLIENT_SECRET`) || 
                           this.configService.get<string>(`${provider}_SECRET_KEY`);
    
    if (envClientId && envClientSecret) {
      return true; // Mode SaaS global actif
    }

    // Fallback : Vérifier la configuration tenant (seulement si tenantId fourni)
    if (!tenantId) {
      return false;
    }

    const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
    return bankingConfig?.isActive === true && bankingConfig?.provider === provider;
  }

  /**
   * Récupère la configuration bancaire (priorité .env, puis DB)
   */
  private async getBankingConfig(tenantId: string, provider: BankingProvider): Promise<{
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    baseUrl?: string;
  }> {
    // Mode SaaS Global : Lire depuis .env en priorité
    // Support des deux formats: GOCARDLESS_CLIENT_ID ou GOCARDLESS_SECRET_ID
    const envClientId = this.configService.get<string>(`${provider}_CLIENT_ID`) || 
                       this.configService.get<string>(`${provider}_SECRET_ID`);
    const envClientSecret = this.configService.get<string>(`${provider}_CLIENT_SECRET`) || 
                           this.configService.get<string>(`${provider}_SECRET_KEY`);
    const envBaseUrl = this.configService.get<string>(`${provider}_BASE_URL`) ||
                      this.configService.get<string>(`${provider}_API_URL`);
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3002';

    if (envClientId && envClientSecret) {
      return {
        clientId: envClientId,
        clientSecret: envClientSecret,
        redirectUri: `${frontendUrl}/banking/callback`,
        baseUrl: envBaseUrl,
      };
    }

    // Fallback : Lire depuis la DB (mode tenant) - seulement si tenantId fourni
    if (!tenantId) {
      throw new BadRequestException(
        'Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.',
      );
    }

    const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
    if (!bankingConfig || !bankingConfig.isActive || bankingConfig.provider !== provider) {
      throw new BadRequestException(
        'Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.',
      );
    }

    return {
      clientId: this.encryptionService.decrypt(bankingConfig.clientId),
      clientSecret: this.encryptionService.decrypt(bankingConfig.clientSecret),
      redirectUri: bankingConfig.redirectUri || `${frontendUrl}/banking/callback`,
      baseUrl: bankingConfig.baseUrl,
    };
  }

  /**
   * Récupère la liste des institutions bancaires depuis GoCardless
   */
  async getInstitutions(country: string = 'FR'): Promise<any[]> {
    // Mode SaaS Global : Vérifier les clés dans .env
    // Support des deux formats: GOCARDLESS_CLIENT_ID ou GOCARDLESS_SECRET_ID
    const envClientId = this.configService.get<string>('GOCARDLESS_CLIENT_ID') || 
                       this.configService.get<string>('GOCARDLESS_SECRET_ID');
    const envClientSecret = this.configService.get<string>('GOCARDLESS_CLIENT_SECRET') || 
                           this.configService.get<string>('GOCARDLESS_SECRET_KEY');
    const envBaseUrl = this.configService.get<string>('GOCARDLESS_BASE_URL') ||
                      this.configService.get<string>('GOCARDLESS_API_URL') ||
                      'https://bankaccountdata.gocardless.com';

    if (!envClientId || !envClientSecret) {
      throw new BadRequestException('Le module bancaire n\'est pas configuré (clés API manquantes dans .env)');
    }

    // GoCardless Bank Account Data API
    // L'endpoint pour les institutions peut être différent selon l'API utilisée
    // Essayer d'abord l'endpoint standard
    let apiUrl = `${envBaseUrl}/api/v2/institutions/?country=${country}`;
    
    // Si l'URL contient déjà /api/v2, ne pas le dupliquer
    if (envBaseUrl.includes('/api/v2')) {
      apiUrl = `${envBaseUrl}/institutions/?country=${country}`;
    }
    
    // Appel réel à l'API GoCardless pour récupérer les institutions
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${envClientId}`, // GoCardless peut utiliser clientId comme token pour certaines APIs
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Erreur GoCardless institutions (${response.status}): ${errorText}`);
      throw new BadRequestException('Erreur lors de la récupération des banques depuis GoCardless');
    }

    const data = await response.json();

    // Formater la réponse selon la structure GoCardless
    // La structure peut être: { results: [...] } ou directement un tableau
    const institutions = data.results || data.institutions || data || [];
    
    return institutions.map((institution: any) => ({
      id: institution.id,
      name: institution.name,
      logo: institution.logo || institution.logo_url || institution.logoUrl,
      bic: institution.bic,
      supportedFeatures: institution.supported_features || institution.supportedFeatures || [],
      country: institution.country || country,
    }));
  }

  /**
   * Génère l'URL de connexion OAuth pour l'agrégateur bancaire
   */
  async generateConnectUrl(tenantId: string, dto: GenerateConnectUrlDto): Promise<{ url: string; state: string }> {
    const { institutionId, provider } = dto;

    // Vérifier que le service est actif
    const isActive = await this.isBankingServiceActive(tenantId, provider);
    if (!isActive) {
      throw new BadRequestException(
        'Le module bancaire n\'est pas configuré. Veuillez contacter votre administrateur.',
      );
    }

    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(tenantId, provider);

    // Générer un state unique pour la sécurité OAuth
    const state = `${tenantId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    let connectUrl: string;

    switch (provider) {
      case BankingProvider.GOCARDLESS:
        connectUrl = await this.generateGoCardlessUrl(tenantId, institutionId, state, config);
        break;
      case BankingProvider.BRIDGE:
        connectUrl = await this.generateBridgeUrl(tenantId, institutionId, state, config);
        break;
      default:
        throw new BadRequestException(`Provider ${provider} non supporté`);
    }

    return {
      url: connectUrl,
      state,
    };
  }

  /**
   * Échange le code d'autorisation contre des tokens d'accès
   */
  async exchangeCodeForToken(tenantId: string, dto: ExchangeCodeDto): Promise<BankConnectionDocument> {
    const { code, state } = dto;

    // Vérifier le state (en production, vérifier dans Redis/DB)
    if (!state.startsWith(tenantId)) {
      throw new BadRequestException('State invalide');
    }

    // Extraire le provider du state ou le déterminer autrement
    // Pour l'instant, on suppose qu'on peut le déterminer depuis le code/state
    // En production, stocker le provider dans le state ou dans une session

    // Appeler l'API de l'agrégateur pour échanger le code
    const tokens = await this.exchangeCodeWithProvider(code, state, tenantId);

    // Créer ou mettre à jour la connexion bancaire
    const connection = await this.createOrUpdateConnection(tenantId, tokens);

    // Synchroniser les comptes bancaires
    await this.syncBankAccounts(connection._id.toString());

    return connection;
  }

  /**
   * Récupère les transactions réelles depuis l'agrégateur
   */
  async fetchRealTransactions(connectionId: string): Promise<any[]> {
    const connection = await this.bankConnectionModel.findById(connectionId).exec();
    if (!connection) {
      throw new NotFoundException(`Connexion bancaire ${connectionId} introuvable`);
    }

    if (!connection.isActive) {
      throw new BadRequestException('La connexion bancaire n\'est plus active');
    }

    // Vérifier si le token a expiré et le rafraîchir si nécessaire
    if (connection.expiresAt && connection.expiresAt < new Date()) {
      await this.refreshAccessToken(connection);
    }

    // Appeler l'API de l'agrégateur pour récupérer les transactions
    const transactions = await this.fetchTransactionsFromProvider(connection);

    // Mettre à jour la date de dernière synchronisation
    connection.lastSyncAt = new Date();
    await connection.save();

    return transactions;
  }

  /**
   * Synchronise les comptes bancaires depuis une connexion
   */
  async syncBankAccounts(connectionId: string): Promise<void> {
    const connection = await this.bankConnectionModel.findById(connectionId).exec();
    if (!connection) {
      throw new NotFoundException(`Connexion bancaire ${connectionId} introuvable`);
    }

    // Récupérer les comptes depuis l'agrégateur
    const accounts = await this.fetchAccountsFromProvider(connection);

    // Créer ou mettre à jour les comptes dans notre base
    for (const account of accounts) {
      await this.bankAccountModel.findOneAndUpdate(
        { externalId: account.externalId, tenantId: connection.tenantId },
        {
          ...account,
          connectionId: connection._id.toString(),
          lastSyncAt: new Date(),
        },
        { upsert: true, new: true },
      ).exec();
    }
  }

  // ========== Méthodes privées pour les providers ==========

  private async generateGoCardlessUrl(
    tenantId: string,
    institutionId: string,
    state: string,
    config: { clientId: string; redirectUri: string; baseUrl?: string },
  ): Promise<string> {
    const clientId = config.clientId;
    const redirectUri = config.redirectUri;
    const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';

    if (!clientId) {
      throw new BadRequestException('Configuration GoCardless invalide (clientId manquant)');
    }

    // Construire l'URL OAuth GoCardless
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'balances,details,transactions',
      institution_id: institutionId,
      state: state,
    });

    return `${baseUrl}/user_authorize?${params.toString()}`;
  }

  private async generateBridgeUrl(
    tenantId: string,
    institutionId: string,
    state: string,
    config: { clientId: string; redirectUri: string; baseUrl?: string },
  ): Promise<string> {
    const clientId = config.clientId;
    const redirectUri = config.redirectUri;
    const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';

    if (!clientId) {
      throw new BadRequestException('Configuration Bridge invalide (clientId manquant)');
    }

    // Construire l'URL OAuth Bridge
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      state: state,
      bank_id: institutionId,
    });

    return `${baseUrl}/connect/items/add?${params.toString()}`;
  }

  private async exchangeCodeWithProvider(
    code: string,
    state: string,
    tenantId: string,
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    provider: BankingProvider;
    institutionId: string;
    institutionName?: string;
  }> {
    // Récupérer la configuration pour déterminer le provider
    const bankingConfig = await this.tenantsService.getBankingConfig(tenantId);
    if (!bankingConfig || !bankingConfig.isActive) {
      throw new BadRequestException('Configuration bancaire non trouvée ou inactive');
    }

    const provider = bankingConfig.provider as BankingProvider;

    if (provider === BankingProvider.GOCARDLESS) {
      return await this.exchangeGoCardlessCode(code, tenantId);
    } else if (provider === BankingProvider.BRIDGE) {
      return await this.exchangeBridgeCode(code, tenantId);
    }

    throw new BadRequestException('Provider non supporté');
  }

  private async exchangeGoCardlessCode(code: string, tenantId: string): Promise<any> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(tenantId, BankingProvider.GOCARDLESS);
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const redirectUri = config.redirectUri || `${this.configService.get<string>('FRONTEND_URL')}/banking/callback`;
    const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Configuration GoCardless incomplète');
    }

    // Appel réel à l'API GoCardless
    const response = await fetch(`${baseUrl}/token/new/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Erreur GoCardless token exchange: ${error}`);
      throw new BadRequestException('Erreur lors de l\'échange du code GoCardless');
    }

    const data = await response.json();

    return {
      accessToken: data.access,
      refreshToken: data.refresh,
      expiresAt: data.access_expires ? new Date(Date.now() + data.access_expires * 1000) : undefined,
      provider: BankingProvider.GOCARDLESS,
      institutionId: data.institution_id || '',
      institutionName: data.institution_name,
    };
  }

  private async exchangeBridgeCode(code: string, tenantId: string): Promise<any> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(tenantId, BankingProvider.BRIDGE);
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const redirectUri = config.redirectUri || `${this.configService.get<string>('FRONTEND_URL')}/banking/callback`;
    const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Configuration Bridge incomplète');
    }

    // Appel réel à l'API Bridge
    const response = await fetch(`${baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Client-Secret': clientSecret,
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Erreur Bridge token exchange: ${error}`);
      throw new BadRequestException('Erreur lors de l\'échange du code Bridge');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
      provider: BankingProvider.BRIDGE,
      institutionId: data.bank_id || '',
      institutionName: data.bank_name,
    };
  }

  private async createOrUpdateConnection(
    tenantId: string,
    tokens: any,
  ): Promise<BankConnectionDocument> {
    return await this.bankConnectionModel.findOneAndUpdate(
      { tenantId, institutionId: tokens.institutionId, provider: tokens.provider },
      {
        tenantId,
        provider: tokens.provider,
        institutionId: tokens.institutionId,
        institutionName: tokens.institutionName,
        accessToken: tokens.accessToken, // TODO: Crypter en production
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
        isActive: true,
      },
      { upsert: true, new: true },
    ).exec();
  }

  private async refreshAccessToken(connection: BankConnectionDocument): Promise<void> {
    if (!connection.refreshToken) {
      throw new BadRequestException('Impossible de rafraîchir le token : refreshToken manquant');
    }

    // Récupérer la configuration depuis la DB
    const bankingConfig = await this.tenantsService.getBankingConfig(connection.tenantId);
    if (!bankingConfig || !bankingConfig.isActive) {
      throw new BadRequestException('Configuration bancaire non trouvée ou inactive');
    }

    let newTokens: any;

    if (connection.provider === BankingProvider.GOCARDLESS) {
      newTokens = await this.refreshGoCardlessToken(connection.refreshToken, connection.tenantId);
    } else if (connection.provider === BankingProvider.BRIDGE) {
      newTokens = await this.refreshBridgeToken(connection.refreshToken, connection.tenantId);
    } else {
      throw new BadRequestException('Provider non supporté pour le refresh');
    }

    connection.accessToken = newTokens.accessToken;
    if (newTokens.refreshToken) {
      connection.refreshToken = newTokens.refreshToken;
    }
    if (newTokens.expiresAt) {
      connection.expiresAt = newTokens.expiresAt;
    }
    await connection.save();
  }

  private async refreshGoCardlessToken(refreshToken: string, tenantId: string): Promise<any> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(tenantId, BankingProvider.GOCARDLESS);
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const baseUrl = config.baseUrl || 'https://bankaccountdata.gocardless.com';

    const response = await fetch(`${baseUrl}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors du rafraîchissement du token GoCardless');
    }

    const data = await response.json();

    return {
      accessToken: data.access,
      refreshToken: data.refresh,
      expiresAt: data.access_expires ? new Date(Date.now() + data.access_expires * 1000) : undefined,
    };
  }

  private async refreshBridgeToken(refreshToken: string, tenantId: string): Promise<any> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(tenantId, BankingProvider.BRIDGE);
    const clientId = config.clientId;
    const clientSecret = config.clientSecret;
    const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';

    const response = await fetch(`${baseUrl}/oauth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': clientId,
        'Client-Secret': clientSecret,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors du rafraîchissement du token Bridge');
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    };
  }

  private async fetchAccountsFromProvider(connection: BankConnectionDocument): Promise<any[]> {
    if (connection.provider === BankingProvider.GOCARDLESS) {
      return await this.fetchGoCardlessAccounts(connection);
    } else if (connection.provider === BankingProvider.BRIDGE) {
      return await this.fetchBridgeAccounts(connection);
    }

    return [];
  }

  private async fetchGoCardlessAccounts(connection: BankConnectionDocument): Promise<any[]> {
    const baseUrl = this.configService.get<string>('GOCARDLESS_BASE_URL') || 'https://bankaccountdata.gocardless.com';

    const response = await fetch(`${baseUrl}/accounts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la récupération des comptes GoCardless');
    }

    const data = await response.json();

    return data.accounts.map((account: any) => ({
      name: account.name || account.iban || 'Compte bancaire',
      iban: account.iban,
      bic: account.bic,
      bankName: connection.institutionName,
      externalId: account.id,
      balance: account.balance?.amount || 0,
      currency: account.balance?.currency || 'EUR',
      provider: BankingProvider.GOCARDLESS,
    }));
  }

  private async fetchBridgeAccounts(connection: BankConnectionDocument): Promise<any[]> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(connection.tenantId, BankingProvider.BRIDGE);
    const clientId = config.clientId;
    const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';

    const response = await fetch(`${baseUrl}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Client-Id': clientId,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la récupération des comptes Bridge');
    }

    const data = await response.json();

    return data.resources.map((account: any) => ({
      name: account.name || account.iban || 'Compte bancaire',
      iban: account.iban,
      bic: account.bic,
      bankName: connection.institutionName,
      externalId: account.id,
      balance: account.balance || 0,
      currency: account.currency || 'EUR',
      provider: BankingProvider.BRIDGE,
    }));
  }

  private async fetchTransactionsFromProvider(connection: BankConnectionDocument): Promise<any[]> {
    if (connection.provider === BankingProvider.GOCARDLESS) {
      return await this.fetchGoCardlessTransactions(connection);
    } else if (connection.provider === BankingProvider.BRIDGE) {
      return await this.fetchBridgeTransactions(connection);
    }

    return [];
  }

  private async fetchGoCardlessTransactions(connection: BankConnectionDocument): Promise<any[]> {
    const baseUrl = this.configService.get<string>('GOCARDLESS_BASE_URL') || 'https://bankaccountdata.gocardless.com';

    // Récupérer les comptes d'abord
    const accountsResponse = await fetch(`${baseUrl}/accounts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
      },
    });

    if (!accountsResponse.ok) {
      throw new BadRequestException('Erreur lors de la récupération des comptes');
    }

    const accountsData = await accountsResponse.json();
    const allTransactions: any[] = [];

    // Récupérer les transactions pour chaque compte
    for (const account of accountsData.accounts) {
      const transactionsResponse = await fetch(`${baseUrl}/accounts/${account.id}/transactions/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${connection.accessToken}`,
        },
      });

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        allTransactions.push(...transactionsData.transactions);
      }
    }

    return allTransactions;
  }

  private async fetchBridgeTransactions(connection: BankConnectionDocument): Promise<any[]> {
    // Récupérer la configuration (priorité .env, puis DB)
    const config = await this.getBankingConfig(connection.tenantId, BankingProvider.BRIDGE);
    const clientId = config.clientId;
    const baseUrl = config.baseUrl || 'https://api.bridgeapi.io/v2';

    const response = await fetch(`${baseUrl}/transactions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${connection.accessToken}`,
        'Client-Id': clientId,
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Erreur lors de la récupération des transactions Bridge');
    }

    const data = await response.json();

    return data.resources || [];
  }
}
