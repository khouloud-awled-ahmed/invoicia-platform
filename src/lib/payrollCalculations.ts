/**
 * Module de calcul de la paie française
 * Conforme aux barèmes URSSAF 2024
 */

export interface PayrollInput {
  baseSalary: number;
  workedDays: number;
  totalDays: number;
  overtime: number;
  bonuses: number;
  absences: number;
  mealVouchers: number;
}

export interface PayrollResult {
  grossSalary: number;
  netSalary: number;
  netTaxable: number;
  employeeCharges: number;
  employerCharges: number;
  totalCost: number;
  breakdown: {
    securiteSociale: { employee: number; employer: number };
    chomage: { employee: number; employer: number };
    retraite: { employee: number; employer: number };
    csg: { deductible: number; nonDeductible: number };
    crds: number;
  };
}

// Barèmes 2024
const RATES = {
  // Cotisations patronales
  employer: {
    securiteSociale: 0.138, // Maladie-Maternité-Invalidité-Décès
    allocationsFamiliales: 0.0325, // 3.25% (< 3.5 SMIC) ou 5.25%
    accidentsTravail: 0.015, // Variable selon le risque (1.5% moyenne)
    chomage: 0.0405, // 4.05%
    retraiteBase: 0.0860, // 8.60%
    retraiteComplementaire: 0.0787, // 7.87% (Agirc-Arrco)
    agff: 0.0120, // 1.20%
    prevoyance: 0.015, // 1.50% (variable)
    contribution: 0.013, // Contribution formation
  },
  // Cotisations salariales
  employee: {
    securiteSociale: 0.069, // 6.90% (+ 0.40% pour l'Alsace-Moselle)
    chomage: 0, // Supprimée pour les salariés
    retraiteBase: 0.069, // 6.90%
    retraiteComplementaire: 0.0315, // 3.15% (tranche 1)
    agff: 0.008, // 0.80%
    csgDeductible: 0.068, // 6.80% sur 98.25% du brut
    csgNonDeductible: 0.024, // 2.40% sur 98.25% du brut
    crds: 0.005, // 0.50% sur 98.25% du brut
  },
  // Plafonds et seuils
  plafondSecuMensuel: 3864, // Plafond mensuel SS 2024
  smicMensuel: 1766.92, // SMIC brut mensuel 151.67h
  smicHoraire: 11.65, // SMIC horaire 2024
  assietteCsg: 0.9825, // 98.25% du brut
};

/**
 * Calcule la paie complète d'un salarié
 */
export function calculatePayroll(input: PayrollInput): PayrollResult {
  // 1. Calcul du salaire brut
  const prorataSalary = (input.baseSalary * input.workedDays) / input.totalDays;
  const overtimePay = input.overtime * (input.baseSalary / 151.67) * 1.25; // +25% heures sup
  const grossSalary = prorataSalary + overtimePay + input.bonuses;

  // 2. Assiette CSG/CRDS (98.25% du brut)
  const assietteCsg = grossSalary * RATES.assietteCsg;

  // 3. Cotisations salariales
  const employeeSecuriteSociale = grossSalary * RATES.employee.securiteSociale;
  const employeeRetraiteBase = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employee.retraiteBase;
  const employeeRetraiteComplementaire = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employee.retraiteComplementaire;
  const employeeAgff = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employee.agff;
  const csgDeductible = assietteCsg * RATES.employee.csgDeductible;
  const csgNonDeductible = assietteCsg * RATES.employee.csgNonDeductible;
  const crds = assietteCsg * RATES.employee.crds;

  const totalEmployeeCharges =
    employeeSecuriteSociale +
    employeeRetraiteBase +
    employeeRetraiteComplementaire +
    employeeAgff +
    csgDeductible +
    csgNonDeductible +
    crds;

  // 4. Cotisations patronales
  const employerSecuriteSociale = grossSalary * RATES.employer.securiteSociale;
  const employerAllocationsFamiliales = grossSalary * RATES.employer.allocationsFamiliales;
  const employerAccidentsTravail = grossSalary * RATES.employer.accidentsTravail;
  const employerChomage = grossSalary * RATES.employer.chomage;
  const employerRetraiteBase = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employer.retraiteBase;
  const employerRetraiteComplementaire = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employer.retraiteComplementaire;
  const employerAgff = Math.min(grossSalary, RATES.plafondSecuMensuel) * RATES.employer.agff;
  const employerPrevoyance = grossSalary * RATES.employer.prevoyance;
  const employerContribution = grossSalary * RATES.employer.contribution;

  const totalEmployerCharges =
    employerSecuriteSociale +
    employerAllocationsFamiliales +
    employerAccidentsTravail +
    employerChomage +
    employerRetraiteBase +
    employerRetraiteComplementaire +
    employerAgff +
    employerPrevoyance +
    employerContribution;

  // 5. Calcul du net
  const netTaxable = grossSalary - (totalEmployeeCharges - csgNonDeductible - crds);
  const netSalary = grossSalary - totalEmployeeCharges;

  // 6. Coût total employeur
  const totalCost = grossSalary + totalEmployerCharges;

  return {
    grossSalary: Math.round(grossSalary * 100) / 100,
    netSalary: Math.round(netSalary * 100) / 100,
    netTaxable: Math.round(netTaxable * 100) / 100,
    employeeCharges: Math.round(totalEmployeeCharges * 100) / 100,
    employerCharges: Math.round(totalEmployerCharges * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    breakdown: {
      securiteSociale: {
        employee: Math.round(employeeSecuriteSociale * 100) / 100,
        employer: Math.round(employerSecuriteSociale * 100) / 100,
      },
      chomage: {
        employee: 0,
        employer: Math.round(employerChomage * 100) / 100,
      },
      retraite: {
        employee: Math.round((employeeRetraiteBase + employeeRetraiteComplementaire) * 100) / 100,
        employer: Math.round((employerRetraiteBase + employerRetraiteComplementaire) * 100) / 100,
      },
      csg: {
        deductible: Math.round(csgDeductible * 100) / 100,
        nonDeductible: Math.round(csgNonDeductible * 100) / 100,
      },
      crds: Math.round(crds * 100) / 100,
    },
  };
}

/**
 * Calcule le coût employeur total
 */
export function calculateEmployerCost(baseSalary: number): number {
  const result = calculatePayroll({
    baseSalary,
    workedDays: 22,
    totalDays: 22,
    overtime: 0,
    bonuses: 0,
    absences: 0,
    mealVouchers: 0,
  });
  return result.totalCost;
}

/**
 * Calcule le salaire net à partir du brut
 */
export function calculateNetFromGross(grossSalary: number): number {
  const result = calculatePayroll({
    baseSalary: grossSalary,
    workedDays: 22,
    totalDays: 22,
    overtime: 0,
    bonuses: 0,
    absences: 0,
    mealVouchers: 0,
  });
  return result.netSalary;
}

/**
 * Calcule le salaire brut à partir du net souhaité
 */
export function calculateGrossFromNet(targetNet: number): number {
  // Approximation par dichotomie
  let min = targetNet;
  let max = targetNet * 1.5;
  let gross = (min + max) / 2;
  
  for (let i = 0; i < 20; i++) {
    const net = calculateNetFromGross(gross);
    if (Math.abs(net - targetNet) < 0.01) {
      break;
    }
    if (net < targetNet) {
      min = gross;
    } else {
      max = gross;
    }
    gross = (min + max) / 2;
  }
  
  return Math.round(gross * 100) / 100;
}

/**
 * Vérifie si le salaire est au moins au SMIC
 */
export function isAboveSMIC(salary: number, hoursWorked: number = 151.67): boolean {
  const hourlyRate = salary / hoursWorked;
  return hourlyRate >= RATES.smicHoraire;
}

/**
 * Calcule les heures supplémentaires
 */
export function calculateOvertime(
  hoursWorked: number,
  contractHours: number = 151.67
): { hours: number; rate: number; amount: number }[] {
  const overtime = hoursWorked - contractHours;
  if (overtime <= 0) {
    return [];
  }

  const result = [];
  
  // 8 premières heures à 125%
  if (overtime <= 8) {
    result.push({ hours: overtime, rate: 1.25, amount: 0 });
  } else {
    result.push({ hours: 8, rate: 1.25, amount: 0 });
    // Heures suivantes à 150%
    result.push({ hours: overtime - 8, rate: 1.50, amount: 0 });
  }

  return result;
}
