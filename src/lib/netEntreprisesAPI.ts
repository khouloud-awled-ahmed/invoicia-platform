/**
 * Module d'intégration avec l'API Net-Entreprises
 * Pour les déclarations DSN (Déclaration Sociale Nominative)
 */

export interface NetEntreprisesConfig {
  environment: "production" | "test";
  siret: string;
  apiKey: string;
  certificate: string;
  baseUrl?: string;
}

export interface DSNPayload {
  declarationType: "mensuelle" | "événementielle" | "signalement";
  period: string; // YYYY-MM
  company: {
    siret: string;
    siren: string;
    name: string;
    address: string;
    ape: string;
  };
  employees: Array<{
    socialSecurityNumber: string;
    firstName: string;
    lastName: string;
    registration: string;
    position: string;
    grossSalary: number;
    netSalary: number;
    workedDays: number;
    absences: number;
    cotisations: {
      securiteSociale: { employee: number; employer: number };
      chomage: { employee: number; employer: number };
      retraite: { employee: number; employer: number };
      csg: { deductible: number; nonDeductible: number };
      crds: number;
    };
  }>;
  totalGrossSalary: number;
  totalEmployeeCharges: number;
  totalEmployerCharges: number;
}

export interface DSNResponse {
  success: boolean;
  fluxNumber?: string;
  acknowledgmentDate?: string;
  status: "pending" | "accepted" | "rejected";
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
  warnings?: Array<{
    code: string;
    message: string;
  }>;
}

/**
 * Client pour l'API Net-Entreprises
 */
export class NetEntreprisesClient {
  private config: NetEntreprisesConfig;
  private baseUrl: string;

  constructor(config: NetEntreprisesConfig) {
    this.config = config;
    this.baseUrl =
      config.baseUrl ||
      (config.environment === "production"
        ? "https://api.net-entreprises.fr/v1"
        : "https://api-test.net-entreprises.fr/v1");
  }

  /**
   * Test de connexion à l'API Net-Entreprises
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      // Simulation de test de connexion
      // Dans un environnement réel, ceci ferait un appel API
      console.log("Testing connection to Net-Entreprises API...");
      console.log("Environment:", this.config.environment);
      console.log("Base URL:", this.baseUrl);

      // Simulation d'un délai réseau
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        connected: true,
        message: "Connexion établie avec succès",
      };
    } catch (error) {
      return {
        connected: false,
        message: `Erreur de connexion: ${error}`,
      };
    }
  }

  /**
   * Envoie une DSN mensuelle
   */
  async sendMonthlyDSN(payload: DSNPayload): Promise<DSNResponse> {
    try {
      console.log("Sending monthly DSN to Net-Entreprises...");
      console.log("Period:", payload.period);
      console.log("Employees:", payload.employees.length);
      console.log("Total gross salary:", payload.totalGrossSalary);

      // Validation du payload
      const validation = this.validateDSNPayload(payload);
      if (!validation.valid) {
        return {
          success: false,
          status: "rejected",
          errors: validation.errors,
        };
      }

      // Génération du fichier DSN
      const dsnFile = this.generateDSNFile(payload);
      console.log("DSN file generated:", dsnFile.substring(0, 200) + "...");

      // Simulation d'envoi à Net-Entreprises
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Dans un environnement réel, on utiliserait fetch ou axios:
      /*
      const response = await fetch(`${this.baseUrl}/dsn/monthly`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/xml',
          'X-SIRET-Declarant': this.config.siret,
          'X-Certificate': this.config.certificate,
        },
        body: dsnFile,
      });

      const result = await response.json();
      */

      // Simulation de réponse
      const fluxNumber = `DSN-${payload.period}-FR${Math.random()
        .toString(36)
        .substr(2, 6)
        .toUpperCase()}`;

      return {
        success: true,
        status: "accepted",
        fluxNumber,
        acknowledgmentDate: new Date().toISOString(),
        warnings: [
          {
            code: "W001",
            message:
              "La période de déclaration est proche de la date limite (5 jours avant échéance)",
          },
        ],
      };
    } catch (error) {
      console.error("Error sending DSN:", error);
      return {
        success: false,
        status: "rejected",
        errors: [
          {
            code: "E500",
            message: `Erreur serveur: ${error}`,
          },
        ],
      };
    }
  }

  /**
   * Récupère le statut d'une DSN envoyée
   */
  async getDSNStatus(fluxNumber: string): Promise<DSNResponse> {
    try {
      console.log("Checking DSN status:", fluxNumber);

      // Simulation
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        status: "accepted",
        fluxNumber,
        acknowledgmentDate: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        status: "rejected",
        errors: [
          {
            code: "E404",
            message: "Flux introuvable",
          },
        ],
      };
    }
  }

  /**
   * Récupère l'accusé de réception d'une DSN
   */
  async getAcknowledgment(fluxNumber: string): Promise<{
    pdf: string;
    date: string;
  }> {
    console.log("Retrieving acknowledgment for:", fluxNumber);

    // Simulation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      pdf: "data:application/pdf;base64,JVBERi0xLjQK...", // Base64 du PDF
      date: new Date().toISOString(),
    };
  }

  /**
   * Valide le payload DSN avant envoi
   */
  private validateDSNPayload(payload: DSNPayload): {
    valid: boolean;
    errors?: Array<{ code: string; message: string; field?: string }>;
  } {
    const errors: Array<{ code: string; message: string; field?: string }> = [];

    // Validation SIRET
    if (!payload.company.siret || payload.company.siret.replace(/\s/g, "").length !== 14) {
      errors.push({
        code: "E001",
        message: "SIRET invalide (14 chiffres requis)",
        field: "company.siret",
      });
    }

    // Validation période
    if (!payload.period || !/^\d{4}-\d{2}$/.test(payload.period)) {
      errors.push({
        code: "E002",
        message: "Format de période invalide (attendu: YYYY-MM)",
        field: "period",
      });
    }

    // Validation employés
    if (!payload.employees || payload.employees.length === 0) {
      errors.push({
        code: "E003",
        message: "Aucun employé à déclarer",
        field: "employees",
      });
    }

    // Validation numéros de sécurité sociale
    payload.employees.forEach((emp, index) => {
      if (
        !emp.socialSecurityNumber ||
        emp.socialSecurityNumber.replace(/\s/g, "").length !== 15
      ) {
        errors.push({
          code: "E004",
          message: `Numéro de sécurité sociale invalide pour ${emp.firstName} ${emp.lastName}`,
          field: `employees[${index}].socialSecurityNumber`,
        });
      }
    });

    // Validation montants
    if (payload.totalGrossSalary <= 0) {
      errors.push({
        code: "E005",
        message: "Masse salariale brute invalide",
        field: "totalGrossSalary",
      });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Génère le fichier DSN au format XML
   */
  private generateDSNFile(payload: DSNPayload): string {
    // Génération d'un fichier DSN simplifié
    // Dans un environnement réel, utilisez une bibliothèque XML complète
    const date = new Date().toISOString().split("T")[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<DSN xmlns="http://www.dsn-info.fr/XMLSchema" version="P23V01">
  <EnveloppeGlobale>
    <Declarant>
      <SIRET>${payload.company.siret.replace(/\s/g, "")}</SIRET>
      <RaisonSociale>${payload.company.name}</RaisonSociale>
      <CodeAPE>${payload.company.ape}</CodeAPE>
    </Declarant>
    <Periode>
      <AnneeReference>${payload.period.split("-")[0]}</AnneeReference>
      <MoisReference>${payload.period.split("-")[1]}</MoisReference>
    </Periode>
    <TypeDeclaration>${payload.declarationType}</TypeDeclaration>
  </EnveloppeGlobale>
  
  <Salaries>
    ${payload.employees
      .map(
        (emp) => `
    <Salarie>
      <NumeroCPS>${emp.socialSecurityNumber.replace(/\s/g, "")}</NumeroCPS>
      <NomNaissance>${emp.lastName}</NomNaissance>
      <Prenoms>${emp.firstName}</Prenoms>
      <Matricule>${emp.registration}</Matricule>
      <Remuneration>
        <BrutTotal>${emp.grossSalary.toFixed(2)}</BrutTotal>
        <NetFiscal>${emp.netSalary.toFixed(2)}</NetFiscal>
        <NetAPayer>${emp.netSalary.toFixed(2)}</NetAPayer>
      </Remuneration>
      <Cotisations>
        <SecuriteSociale>
          <Salarie>${emp.cotisations.securiteSociale.employee.toFixed(2)}</Salarie>
          <Employeur>${emp.cotisations.securiteSociale.employer.toFixed(2)}</Employeur>
        </SecuriteSociale>
        <Chomage>
          <Salarie>${emp.cotisations.chomage.employee.toFixed(2)}</Salarie>
          <Employeur>${emp.cotisations.chomage.employer.toFixed(2)}</Employeur>
        </Chomage>
        <Retraite>
          <Salarie>${emp.cotisations.retraite.employee.toFixed(2)}</Salarie>
          <Employeur>${emp.cotisations.retraite.employer.toFixed(2)}</Employeur>
        </Retraite>
        <CSG>
          <Deductible>${emp.cotisations.csg.deductible.toFixed(2)}</Deductible>
          <NonDeductible>${emp.cotisations.csg.nonDeductible.toFixed(2)}</NonDeductible>
        </CSG>
        <CRDS>${emp.cotisations.crds.toFixed(2)}</CRDS>
      </Cotisations>
    </Salarie>`
      )
      .join("")}
  </Salaries>
  
  <Totaux>
    <MasseSalarialeTotal>${payload.totalGrossSalary.toFixed(2)}</MasseSalarialeTotal>
    <CotisationsSalariesTotal>${payload.totalEmployeeCharges.toFixed(2)}</CotisationsSalariesTotal>
    <CotisationsEmployeurTotal>${payload.totalEmployerCharges.toFixed(2)}</CotisationsEmployeurTotal>
  </Totaux>
  
  <DateEnvoi>${date}</DateEnvoi>
</DSN>`;
  }
}

/**
 * Créer une instance du client Net-Entreprises
 */
export function createNetEntreprisesClient(config: NetEntreprisesConfig): NetEntreprisesClient {
  return new NetEntreprisesClient(config);
}

/**
 * Helper pour générer un payload DSN à partir des données de paie
 */
export function prepareDSNPayload(
  period: string,
  company: any,
  employees: any[],
  payrolls: any[]
): DSNPayload {
  const employeesData = employees.map((emp) => {
    const payroll = payrolls.find((p) => p.employeeId === emp.id);
    if (!payroll) {
      throw new Error(`Paie non trouvée pour l'employé ${emp.id}`);
    }

    return {
      socialSecurityNumber: emp.socialSecurityNumber,
      firstName: emp.firstName,
      lastName: emp.lastName,
      registration: emp.registration,
      position: emp.position,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      workedDays: payroll.workedDays,
      absences: payroll.absences,
      cotisations: {
        securiteSociale: {
          employee: payroll.grossSalary * 0.069,
          employer: payroll.grossSalary * 0.138,
        },
        chomage: {
          employee: 0,
          employer: payroll.grossSalary * 0.0405,
        },
        retraite: {
          employee: payroll.grossSalary * 0.0315,
          employer: payroll.grossSalary * 0.0787,
        },
        csg: {
          deductible: payroll.grossSalary * 0.9825 * 0.068,
          nonDeductible: payroll.grossSalary * 0.9825 * 0.024,
        },
        crds: payroll.grossSalary * 0.9825 * 0.005,
      },
    };
  });

  const totalGrossSalary = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalEmployeeCharges = payrolls.reduce((sum, p) => sum + p.employeeCharges, 0);
  const totalEmployerCharges = payrolls.reduce((sum, p) => sum + p.employerCharges, 0);

  return {
    declarationType: "mensuelle",
    period,
    company: {
      siret: company.siret,
      siren: company.siren,
      name: company.name,
      address: company.address,
      ape: company.ape,
    },
    employees: employeesData,
    totalGrossSalary,
    totalEmployeeCharges,
    totalEmployerCharges,
  };
}
