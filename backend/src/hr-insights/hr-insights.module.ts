import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbsenceRiskController } from './absence-risk.controller';
import { AbsenceRiskService } from './absence-risk.service';
import { AiReportController } from './ai-report.controller';
import { AiReportService } from './ai-report.service';
import { Absence, AbsenceSchema } from '../absences/schemas/absence.schema';
import { Employee, EmployeeSchema } from '../employees/schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Absence.name, schema: AbsenceSchema },
      { name: Employee.name, schema: EmployeeSchema },
    ]),
  ],
  controllers: [AbsenceRiskController, AiReportController],
  providers: [AbsenceRiskService, AiReportService],
  exports: [AbsenceRiskService, AiReportService],
})
export class HrInsightsModule {}
