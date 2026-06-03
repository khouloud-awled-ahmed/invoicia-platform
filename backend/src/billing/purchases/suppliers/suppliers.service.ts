import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from '../../../suppliers/schemas/supplier.schema';

@Injectable()
export class SuppliersService {
  constructor(@InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>) {}

  // ─── STATS (for Fournisseurs dashboard) ───────────────────────
  async getStats(tenantId: string) {
    const suppliers = await this.supplierModel.find({ tenantId }).exec();
    const active = suppliers.filter((s) => s.status === 'active').length;
    const inactive = suppliers.filter((s) => s.status === 'inactive').length;

    // Count all intervenants linked
    const totalIntervenants = suppliers.reduce(
      (sum, s) => sum + (s.intervenantIds?.length || 0),
      0,
    );

    return {
      total: suppliers.length,
      active,
      inactive,
      totalIntervenants,
    };
  }

  // ─── CREATE ───────────────────────────────────────────────────
  async create(createDto: any, tenantId: string): Promise<Supplier> {
    const supplier = new this.supplierModel({ ...createDto, tenantId });
    return supplier.save();
  }

  // ─── LIST with filters & search ───────────────────────────────
  async findAll(tenantId: string, filters?: any): Promise<Supplier[]> {
    const query: any = { tenantId };

    if (filters?.status) query.status = filters.status;

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { businessName: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { matriculeFiscal: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.supplierModel.find(query).sort({ name: 1 }).exec();
  }

  // ─── FIND ONE ─────────────────────────────────────────────────
  async findOne(id: string, tenantId: string): Promise<Supplier> {
    const supplier = await this.supplierModel.findOne({ _id: id, tenantId }).exec();
    if (!supplier) {
      throw new NotFoundException(`Fournisseur #${id} introuvable`);
    }
    return supplier;
  }

  // ─── UPDATE ───────────────────────────────────────────────────
  async update(id: string, updateDto: any, tenantId: string): Promise<Supplier> {
    const updated = await this.supplierModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Fournisseur #${id} introuvable`);
    }
    return updated;
  }

  // ─── DELETE ───────────────────────────────────────────────────
  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.supplierModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Fournisseur #${id} introuvable`);
    }
  }

  // ─── TOGGLE STATUS active/inactive ────────────────────────────
  async toggleStatus(id: string, tenantId: string): Promise<Supplier> {
    const supplier = await this.findOne(id, tenantId);
    const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
    const updated = await this.supplierModel
      .findOneAndUpdate({ _id: id, tenantId }, { status: newStatus }, { new: true })
      .exec();
    return updated!;
  }

  // ─── LINK INTERVENANT ─────────────────────────────────────────
  async addIntervenant(id: string, intervenantId: string, tenantId: string): Promise<Supplier> {
    const updated = await this.supplierModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { $addToSet: { intervenantIds: intervenantId } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException(`Fournisseur #${id} introuvable`);
    return updated;
  }

  // ─── UNLINK INTERVENANT ───────────────────────────────────────
  async removeIntervenant(id: string, intervenantId: string, tenantId: string): Promise<Supplier> {
    const updated = await this.supplierModel
      .findOneAndUpdate(
        { _id: id, tenantId },
        { $pull: { intervenantIds: intervenantId } },
        { new: true },
      )
      .exec();
    if (!updated) throw new NotFoundException(`Fournisseur #${id} introuvable`);
    return updated;
  }
}
