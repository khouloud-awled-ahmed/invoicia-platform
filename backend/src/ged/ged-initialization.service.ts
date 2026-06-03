import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GEDFolder, GEDFolderDocument } from './schemas/ged-folder.schema';
import {
  GEDClassificationRule,
  GEDClassificationRuleDocument,
} from './schemas/ged-classification-rule.schema';

@Injectable()
export class GEDInitializationService {
  constructor(
    @InjectModel(GEDFolder.name) private folderModel: Model<GEDFolderDocument>,
    @InjectModel(GEDClassificationRule.name)
    private ruleModel: Model<GEDClassificationRuleDocument>,
  ) {}

  async initializeDefaultStructure(tenantId: string): Promise<void> {
    // Vérifier si la structure existe déjà
    const existingFolders = await this.folderModel.find({ tenantId, parentId: null }).exec();
    if (existingFolders.length > 0) {
      return; // Structure déjà initialisée
    }

    // Créer les dossiers principaux
    const facturesFolder = await this.createFolder(tenantId, 'Factures', null, 'factures');
    const depensesFolder = await this.createFolder(tenantId, 'Dépenses', null, 'depenses');
    const avoirsFolder = await this.createFolder(tenantId, 'Avoirs', null, 'avoirs');
    const devisFolder = await this.createFolder(tenantId, 'Devis', null, 'devis');
    const docsFournisseursFolder = await this.createFolder(
      tenantId,
      'Documents Fournisseurs',
      null,
      'documents_fournisseurs',
    );
    const docsClientsFolder = await this.createFolder(
      tenantId,
      'Documents Clients',
      null,
      'documents_clients',
    );
    const contratsFolder = await this.createFolder(tenantId, 'Contrats', null, 'contrats');
    const docsSocieteFolder = await this.createFolder(
      tenantId,
      'Documents Société',
      null,
      'documents_societe',
    );

    // Créer les sous-dossiers pour l'année en cours
    const currentYear = new Date().getFullYear();
    const facturesFolderId = (facturesFolder as any)._id.toString();
    const depensesFolderId = (depensesFolder as any)._id.toString();
    await this.createFolder(tenantId, currentYear.toString(), facturesFolderId, 'factures');
    await this.createFolder(tenantId, currentYear.toString(), depensesFolderId, 'depenses');

    // Créer les règles de classement par défaut
    await this.createDefaultClassificationRules(tenantId, {
      factures: facturesFolderId,
      depenses: depensesFolderId,
      avoirs: (avoirsFolder as any)._id.toString(),
      devis: (devisFolder as any)._id.toString(),
      documents_fournisseurs: (docsFournisseursFolder as any)._id.toString(),
      documents_clients: (docsClientsFolder as any)._id.toString(),
      contrats: (contratsFolder as any)._id.toString(),
      documents_societe: (docsSocieteFolder as any)._id.toString(),
    });
  }

  private async createFolder(
    tenantId: string,
    name: string,
    parentId: string | null,
    documentType: string,
  ): Promise<GEDFolderDocument> {
    const parentPath = parentId
      ? (await this.folderModel.findById(parentId).exec())?.path || '/'
      : '/';
    const path = parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;

    const folder = new this.folderModel({
      tenantId,
      name,
      parentId: parentId || undefined,
      path,
      documentType,
    });

    return folder.save();
  }

  private async createDefaultClassificationRules(
    tenantId: string,
    folderIds: {
      factures: string;
      depenses: string;
      avoirs: string;
      devis: string;
      documents_fournisseurs: string;
      documents_clients: string;
      contrats: string;
      documents_societe: string;
    },
  ): Promise<void> {
    const rules = [
      {
        name: 'Factures - Détection automatique',
        documentType: 'facture',
        targetFolderId: folderIds.factures,
        keywords: ['facture', 'invoice', 'fact'],
        fileExtensions: ['.pdf', '.jpg', '.png'],
        priority: 10,
      },
      {
        name: 'Dépenses - Détection automatique',
        documentType: 'depense',
        targetFolderId: folderIds.depenses,
        keywords: ['depense', 'expense', 'note de frais', 'frais'],
        fileExtensions: ['.pdf', '.jpg', '.png'],
        priority: 10,
      },
      {
        name: 'Avoirs - Détection automatique',
        documentType: 'avoir',
        targetFolderId: folderIds.avoirs,
        keywords: ['avoir', 'credit note', 'note de credit'],
        fileExtensions: ['.pdf'],
        priority: 10,
      },
      {
        name: 'Devis - Détection automatique',
        documentType: 'devis',
        targetFolderId: folderIds.devis,
        keywords: ['devis', 'quote', 'proposition', 'estimation'],
        fileExtensions: ['.pdf', '.doc', '.docx'],
        priority: 10,
      },
      {
        name: 'Documents Fournisseurs - Détection automatique',
        documentType: 'document_fournisseur',
        targetFolderId: folderIds.documents_fournisseurs,
        keywords: ['fournisseur', 'supplier', 'vendor'],
        fileExtensions: ['.pdf', '.jpg', '.png'],
        priority: 8,
      },
      {
        name: 'Documents Clients - Détection automatique',
        documentType: 'document_client',
        targetFolderId: folderIds.documents_clients,
        keywords: ['client', 'customer'],
        fileExtensions: ['.pdf', '.doc', '.docx'],
        priority: 8,
      },
      {
        name: 'Contrats - Détection automatique',
        documentType: 'contrat',
        targetFolderId: folderIds.contrats,
        keywords: ['contrat', 'contract', 'convention', 'accord'],
        fileExtensions: ['.pdf', '.doc', '.docx'],
        priority: 10,
      },
      {
        name: 'Documents Société - Détection automatique',
        documentType: 'document_societe',
        targetFolderId: folderIds.documents_societe,
        keywords: ['k-bis', 'statuts', 'societe', 'company', 'rcs', 'siret'],
        fileExtensions: ['.pdf', '.jpg', '.png'],
        priority: 10,
      },
    ];

    for (const ruleData of rules) {
      const rule = new this.ruleModel({
        tenantId,
        ...ruleData,
      });
      await rule.save();
    }
  }
}
