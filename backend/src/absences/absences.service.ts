import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Absence, AbsenceDocument } from './schemas/absence.schema';

@Injectable()
export class AbsencesService {
  constructor(
    @InjectModel(Absence.name) private absenceModel: Model<AbsenceDocument>,
  ) {}

  // ─── CREATE ───────────────────────────────────────────────────
  async create(dto: any, tenantId: string): Promise<Absence> {
    if (!dto.employeeId || !dto.type || !dto.startDate || !dto.endDate) {
      throw new BadRequestException('Champs obligatoires manquants');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('La date de fin doit être après la date de début');
    }

    const days = Math.max(1, Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1);

    const absence = new this.absenceModel({
      ...dto,
      tenantId,
      startDate,
      endDate,
      days,
      status: 'pending',
    });

    return absence.save();
  }

  // ─── LIST ─────────────────────────────────────────────────────
  async findAll(tenantId: string, filters?: any): Promise<Absence[]> {
    const query: any = { tenantId };
    if (filters?.status) query.status = filters.status;
    if (filters?.employeeId) query.employeeId = filters.employeeId;
    if (filters?.type) query.type = filters.type;
    return this.absenceModel.find(query).sort({ startDate: -1 }).exec();
  }

  // ─── FIND ONE ─────────────────────────────────────────────────
  async findOne(id: string, tenantId: string): Promise<Absence> {
    const absence = await this.absenceModel.findOne({ _id: id, tenantId }).exec();
    if (!absence) throw new NotFoundException(`Absence #${id} introuvable`);
    return absence;
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  async update(id: string, dto: any, tenantId: string): Promise<Absence> {
    const updated = await this.absenceModel
      .findOneAndUpdate({ _id: id, tenantId }, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Absence #${id} introuvable`);
    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────
  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.absenceModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) throw new NotFoundException(`Absence #${id} introuvable`);
  }

  // ─── APPROVE ──────────────────────────────────────────────────
  async approve(id: string, tenantId: string, approvedBy?: string): Promise<Absence> {
    const absence = await this.findOne(id, tenantId);
    if (absence.status !== 'pending') {
      throw new BadRequestException('Seules les demandes en attente peuvent être approuvées');
    }
    const updated = await this.absenceModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { status: 'approved', approvedBy, approvedAt: new Date() },
        { new: true },
      )
      .exec();
    return updated!;
  }

  // ─── REJECT ───────────────────────────────────────────────────
  async reject(id: string, tenantId: string): Promise<Absence> {
    const absence = await this.findOne(id, tenantId);
    if (absence.status !== 'pending') {
      throw new BadRequestException('Seules les demandes en attente peuvent être refusées');
    }
    const updated = await this.absenceModel
      .findOneAndUpdate({ _id: id, tenantId }, { status: 'rejected' }, { new: true })
      .exec();
    return updated!;
  }

  // ─── STATS ────────────────────────────────────────────────────
  async getStats(tenantId: string) {
    const absences = await this.absenceModel.find({ tenantId }).exec();

    const pending = absences.filter(a => a.status === 'pending').length;
    const approved = absences.filter(a => a.status === 'approved').length;
    const rejected = absences.filter(a => a.status === 'rejected').length;
    const totalDays = absences
      .filter(a => a.status === 'approved')
      .reduce((sum, a) => sum + a.days, 0);

    // By type
    const byType: Record<string, number> = {};
    for (const a of absences.filter(ab => ab.status === 'approved')) {
      byType[a.type] = (byType[a.type] || 0) + a.days;
    }

    return {
      total: absences.length,
      pending,
      approved,
      rejected,
      totalDays,
      byType,
    };
  }
}