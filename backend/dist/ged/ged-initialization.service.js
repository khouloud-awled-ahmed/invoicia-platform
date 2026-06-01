"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEDInitializationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ged_folder_schema_1 = require("./schemas/ged-folder.schema");
const ged_classification_rule_schema_1 = require("./schemas/ged-classification-rule.schema");
let GEDInitializationService = class GEDInitializationService {
    constructor(folderModel, ruleModel) {
        this.folderModel = folderModel;
        this.ruleModel = ruleModel;
    }
    async initializeDefaultStructure(tenantId) {
        const existingFolders = await this.folderModel.find({ tenantId, parentId: null }).exec();
        if (existingFolders.length > 0) {
            return;
        }
        const facturesFolder = await this.createFolder(tenantId, 'Factures', null, 'factures');
        const depensesFolder = await this.createFolder(tenantId, 'Dépenses', null, 'depenses');
        const avoirsFolder = await this.createFolder(tenantId, 'Avoirs', null, 'avoirs');
        const devisFolder = await this.createFolder(tenantId, 'Devis', null, 'devis');
        const docsFournisseursFolder = await this.createFolder(tenantId, 'Documents Fournisseurs', null, 'documents_fournisseurs');
        const docsClientsFolder = await this.createFolder(tenantId, 'Documents Clients', null, 'documents_clients');
        const contratsFolder = await this.createFolder(tenantId, 'Contrats', null, 'contrats');
        const docsSocieteFolder = await this.createFolder(tenantId, 'Documents Société', null, 'documents_societe');
        const currentYear = new Date().getFullYear();
        const facturesFolderId = facturesFolder._id.toString();
        const depensesFolderId = depensesFolder._id.toString();
        await this.createFolder(tenantId, currentYear.toString(), facturesFolderId, 'factures');
        await this.createFolder(tenantId, currentYear.toString(), depensesFolderId, 'depenses');
        await this.createDefaultClassificationRules(tenantId, {
            factures: facturesFolderId,
            depenses: depensesFolderId,
            avoirs: avoirsFolder._id.toString(),
            devis: devisFolder._id.toString(),
            documents_fournisseurs: docsFournisseursFolder._id.toString(),
            documents_clients: docsClientsFolder._id.toString(),
            contrats: contratsFolder._id.toString(),
            documents_societe: docsSocieteFolder._id.toString(),
        });
    }
    async createFolder(tenantId, name, parentId, documentType) {
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
    async createDefaultClassificationRules(tenantId, folderIds) {
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
};
exports.GEDInitializationService = GEDInitializationService;
exports.GEDInitializationService = GEDInitializationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ged_folder_schema_1.GEDFolder.name)),
    __param(1, (0, mongoose_1.InjectModel)(ged_classification_rule_schema_1.GEDClassificationRule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], GEDInitializationService);
//# sourceMappingURL=ged-initialization.service.js.map