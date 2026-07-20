import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Absence, AbsenceDocument } from '../absences/schemas/absence.schema';
import { Employee, EmployeeDocument } from '../employees/schemas/employee.schema';

export interface RiskScore {
  employeeId: string;
  employeeName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    frequencyScore: number;
    trendScore: number;
    unplannedRatioScore: number;
  };
  absenceCountLast90Days: number;
  absenceCountPrevious90Days: number;
}

@Injectable()
export class AbsenceRiskService {
  constructor(
    @InjectModel(Absence.name) private absenceModel: Model<AbsenceDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async computeAllRiskScores(tenantId: string): Promise<RiskScore[]> {
    const now = new Date();
    const last90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const prev90 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const employees = await this.employeeModel
      .find({ tenantId, status: 'active' })
      .lean();

    const scores: RiskScore[] = [];

    for (const emp of employees) {
      const empId = (emp as any)._id.toString();

      const recentAbsences = await this.absenceModel
        .find({ tenantId, employeeId: empId, startDate: { $gte: last90 } })
        .lean();

      const previousAbsences = await this.absenceModel
        .find({
          tenantId,
          employeeId: empId,
          startDate: { $gte: prev90, $lt: last90 },
        })
        .lean();

      const recentCount = recentAbsences.length;
      const previousCount = previousAbsences.length;

      const frequencyScore = Math.min(100, (recentCount / 6) * 100);

      const trendDelta = recentCount - previousCount;
      const trendScore = Math.max(0, Math.min(100, 50 + trendDelta * 15));

      const unplannedCount = recentAbsences.filter((a) =>
        ['MALADIE', 'AUTRE'].includes(a.type),
      ).length;
      const unplannedRatioScore =
        recentCount > 0 ? (unplannedCount / recentCount) * 100 : 0;

      const riskScore = Math.round(
        frequencyScore * 0.45 + trendScore * 0.3 + unplannedRatioScore * 0.25,
      );

      let riskLevel: RiskScore['riskLevel'] = 'low';
      if (riskScore >= 70) riskLevel = 'high';
      else if (riskScore >= 40) riskLevel = 'medium';

      scores.push({
        employeeId: empId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        riskScore,
        riskLevel,
        factors: {
          frequencyScore: Math.round(frequencyScore),
          trendScore: Math.round(trendScore),
          unplannedRatioScore: Math.round(unplannedRatioScore),
        },
        absenceCountLast90Days: recentCount,
        absenceCountPrevious90Days: previousCount,
      });
    }

    return scores.sort((a, b) => b.riskScore - a.riskScore);
  }

  async getHighRiskEmployees(tenantId: string): Promise<RiskScore[]> {
    const all = await this.computeAllRiskScores(tenantId);
    return all.filter((s) => s.riskLevel === 'high');
  }
}
