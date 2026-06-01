import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';
import { SocialOrg, SocialOrgDocument } from './schemas/social-org.schema';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';

@Injectable()
export class DSNGeneratorService {
  private readonly logger = new Logger(DSNGeneratorService.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(SocialOrg.name) private socialOrgModel: Model<SocialOrgDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  /**
   * Génère un fichier DSN au format NEODeS pour un mois donné
   * @param tenantId ID du tenant
   * @param month Mois (format: MM)
   * @param year Année (format: YYYY)
   * @returns Contenu du fichier DSN
   */
  async generateMonthlyDSN(tenantId: string, month: string, year: string): Promise<string> {
    // Récupérer le tenant avec ses paramètres de paie
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const payrollSettings = tenant.payrollSettings || {};
    const identifier = payrollSettings.matriculeFiscal || (tenant as any).matriculeFiscal;
    if (!identifier) {
      throw new NotFoundException('Les paramètres de paie ne sont pas configurés (Matricule Fiscal manquant)');
    }

    // Récupérer les employés actifs
    const employees = await this.employeeModel
      .find({ tenantId, status: 'active' })
      .exec();

    // Récupérer les organismes sociaux
    const socialOrgs = await this.socialOrgModel.find({ tenantId }).exec();

    // Générer les lignes du fichier DSN
    const lines: string[] = [];

    // Bloc 00 - Envoi
    lines.push(this.generateBlock00(payrollSettings, month, year));

    // Bloc 05 - Déclaration
    lines.push(this.generateBlock05(month, year));

    // Bloc 11 - Entreprise
    lines.push(this.generateBlock11(tenant, payrollSettings));

    // Pour chaque employé actif
    for (const employee of employees) {
      // Bloc 30 - Individu
      lines.push(this.generateBlock30(employee as EmployeeDocument));

      // Bloc 40 - Contrat
      lines.push(this.generateBlock40(employee as EmployeeDocument));

      // Bloc 70 - Affiliation (pour chaque organisme social)
      for (const socialOrg of socialOrgs) {
        lines.push(this.generateBlock70(employee as EmployeeDocument, socialOrg));
      }
    }

    // Joindre toutes les lignes avec des retours à la ligne
    return lines.join('\r\n') + '\r\n';
  }

  /**
   * Bloc 00 - Envoi
   * Format: 00|DSN_SENDER_ID|DATE_ENVOI|HEURE_ENVOI|...
   */
  private generateBlock00(payrollSettings: any, month: string, year: string): string {
    const dsnSenderId = payrollSettings.dsnSenderId || 'DSN-SENDER-001';
    const dateEnvoi = this.formatDateDDMMYYYY(new Date());
    const heureEnvoi = this.formatTimeHHMMSS(new Date());

    // Format simplifié : 00|SENDER_ID|DATE|HEURE|TYPE|VERSION
    return `00|${this.padRight(dsnSenderId, 20)}|${dateEnvoi}|${heureEnvoi}|01|V01`;
  }

  /**
   * Bloc 05 - Déclaration
   * Format: 05|TYPE_DECLARATION|MOIS|ANNEE|...
   */
  private generateBlock05(month: string, year: string): string {
    // Type 01 = Déclaration mensuelle
    const typeDeclaration = '01';
    const mois = month.padStart(2, '0');
    const annee = year;

    // Format simplifié : 05|TYPE|MOIS|ANNEE|NATURE|REGIME
    return `05|${typeDeclaration}|${mois}|${annee}|01|01`;
  }

  /**
   * Bloc 11 - Entreprise
   * Format: 11|SIRET|NIC|APE_CODE|...
   */
  private generateBlock11(tenant: Tenant, payrollSettings: any): string {
    // Tunisie : Matricule Fiscal (ex: 1234567/A/B/M/000) ; pour compatibilité format DSN on utilise un identifiant normalisé
    const mf = (payrollSettings.matriculeFiscal || (tenant as any).matriculeFiscal || '').replace(/\s/g, '');
    const siretCompat = mf.padEnd(14, ' ').substring(0, 14);
    const nic = (payrollSettings.nic || '').padStart(5, '0');
    const apeCode = (payrollSettings.apeCode || '').padEnd(5, ' ');
    const cnssId = (payrollSettings.affiliationCNSS || '').padEnd(20, ' ');

    const raisonSociale = (tenant.businessName || tenant.name || '').substring(0, 50).padEnd(50, ' ');
    return `11|${siretCompat}|${nic}|${apeCode}|${cnssId}|${raisonSociale}`;
  }

  /**
   * Bloc 30 - Individu
   * Format: 30|NIR|NOM|PRENOM|DATE_NAISSANCE|...
   */
  private generateBlock30(employee: EmployeeDocument): string {
    // NIR (Numéro d'Inscription au Répertoire) - 15 caractères, placeholder si non disponible
    const nir = '0'.padStart(15, '0');
    
    // Nom en majuscules, limité à 38 caractères
    const nom = (employee.lastName || '').toUpperCase().substring(0, 38).padEnd(38, ' ');
    
    // Prénom, limité à 38 caractères
    const prenom = (employee.firstName || '').substring(0, 38).padEnd(38, ' ');
    
    // Date de naissance au format JJMMAAAA
    const dateNaissance = employee.birthDate
      ? this.formatDateDDMMYYYY(employee.birthDate)
      : '00000000';

    // Format simplifié : 30|NIR|NOM|PRENOM|DATE_NAISSANCE|SEXE
    return `30|${nir}|${nom}|${prenom}|${dateNaissance}|1`;
  }

  /**
   * Bloc 40 - Contrat
   * Format: 40|NUMERO_CONTRAT|TYPE_CONTRAT|DATE_DEBUT|DATE_FIN|...
   */
  private generateBlock40(employee: EmployeeDocument): string {
    // Numéro de contrat (généré à partir de l'ID de l'employé)
    const numeroContrat = ((employee as any)._id?.toString() || '').substring(0, 10).padEnd(10, ' ');
    
    // Type de contrat : 01 = CDI, 02 = CDD, 03 = Intérim, etc.
    // Par défaut CDI si non spécifié
    const typeContrat = '01';
    
    // Date de début au format JJMMAAAA
    const dateDebut = employee.hireDate
      ? this.formatDateDDMMYYYY(employee.hireDate)
      : this.formatDateDDMMYYYY(new Date());

    // Date de fin (vide pour CDI)
    const dateFin = '00000000';

    // Format simplifié : 40|NUM_CONTRAT|TYPE|DATE_DEBUT|DATE_FIN|QUALIFICATION
    return `40|${numeroContrat}|${typeContrat}|${dateDebut}|${dateFin}|0000`;
  }

  /**
   * Bloc 70 - Affiliation
   * Format: 70|NUMERO_CONTRAT|CODE_ORGANISME|NUMERO_AFFILIATION|...
   */
  private generateBlock70(employee: EmployeeDocument, socialOrg: SocialOrg): string {
    // Numéro de contrat (même que bloc 40)
    const numeroContrat = ((employee as any)._id?.toString() || '').substring(0, 10).padEnd(10, ' ');
    
    // Code organisme (utilise le contractId du SocialOrg ou un code par défaut)
    const codeOrganisme = (socialOrg.contractId || socialOrg.name.substring(0, 5).toUpperCase()).padEnd(5, ' ');
    
    // Numéro d'affiliation
    const numeroAffiliation = (socialOrg.affiliationId || '').padEnd(20, ' ');

    // Type d'affiliation : 01 = Mutuelle, 02 = Prévoyance, etc.
    // On détermine le type selon le nom de l'organisme
    let typeAffiliation = '01'; // Par défaut Mutuelle
    const orgName = (socialOrg.name || '').toUpperCase();
    if (orgName.includes('PREVOYANCE') || orgName.includes('PREV')) {
      typeAffiliation = '02';
    } else if (orgName.includes('RETRAITE') || orgName.includes('RET')) {
      typeAffiliation = '03';
    }

    // Format simplifié : 70|NUM_CONTRAT|CODE_ORG|NUM_AFFILIATION|TYPE|DATE_EFFET
    const dateEffet = employee.hireDate
      ? this.formatDateDDMMYYYY(employee.hireDate)
      : this.formatDateDDMMYYYY(new Date());

    return `70|${numeroContrat}|${codeOrganisme}|${numeroAffiliation}|${typeAffiliation}|${dateEffet}`;
  }

  /**
   * Formate une date au format JJMMAAAA
   */
  private formatDateDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}${month}${year}`;
  }

  /**
   * Formate une heure au format HHMMSS
   */
  private formatTimeHHMMSS(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`;
  }

  /**
   * Complète une chaîne à droite avec des espaces
   */
  private padRight(str: string, length: number): string {
    return (str || '').substring(0, length).padEnd(length, ' ');
  }
}
