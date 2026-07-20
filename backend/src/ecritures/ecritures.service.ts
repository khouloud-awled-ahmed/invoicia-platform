import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ecriture, EcritureDocument } from './schemas/ecriture.schema';
@Injectable()
export class EcrituresService {
  constructor(@InjectModel(Ecriture.name) private ecritureModel: Model<EcritureDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.ecritureModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.ecritureModel.find({ tenantId }).sort({ date: -1 }).exec();
  }

  async getGrandLivre(tenantId: string) {
    const entries = await this.ecritureModel.find({ tenantId }).sort({ compte: 1, date: 1 }).exec();
    const grouped: Record<string, any[]> = {};
    for (const e of entries) {
      const key = e.compte || 'INCONNU';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ date: e.date, journal: e.journal, libelle: e.libelle, debit: e.debit, credit: e.credit });
    }
    return Object.entries(grouped).map(([compte, lines]) => ({ compte, lines }));
  }

  async getCompteDeResultat(tenantId: string) {
    const entries = await this.ecritureModel.find({ tenantId }).exec();
    const totalProduits = entries.reduce((s, e) => s + (e.credit || 0), 0);
    const totalCharges = entries.reduce((s, e) => s + (e.debit || 0), 0);
    return {
      totalProduits,
      totalCharges,
      resultatNet: totalProduits - totalCharges,
    };
  }

  async exportFEC(tenantId: string): Promise<string> {
    const entries = await this.ecritureModel.find({ tenantId }).sort({ date: 1 }).exec();
    const header = ['JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'].join('|');
    const rows = entries.map((e: any, idx: number) => [
      e.journal || '',
      e.journal || '',
      String(idx + 1).padStart(6, '0'),
      (e.date || '').replace(/-/g, ''),
      e.compte || '',
      e.libelle || '',
      '', '',
      '', (e.date || '').replace(/-/g, ''),
      e.libelle || '',
      (e.debit || 0).toFixed(2),
      (e.credit || 0).toFixed(2),
      '', '', (e.date || '').replace(/-/g, ''), '', '',
    ].join('|'));
    return [header, ...rows].join('\n');
  }

  suggestAccountType(compte: string): string {
    if (!compte) return 'CHARGE';
    const prefix = compte.charAt(0);
    if (prefix === '4' && compte.startsWith('44')) {
      return compte.length > 2 && compte.charAt(2) === '3' ? 'TVA_COLLECTEE' : 'TVA_DEDUCTIBLE';
    }
    if (['1', '2', '3', '5'].includes(prefix)) return prefix === '1' || prefix === '5' ? 'PASSIF' : 'ACTIF';
    if (prefix === '4') return 'ACTIF';
    if (prefix === '6') return 'CHARGE';
    if (prefix === '7') return 'PRODUIT';
    return 'CHARGE';
  }

  async getBilan(tenantId: string) {
    const entries = await this.ecritureModel.find({ tenantId }).exec();
    const actif = { total: 0 };
    const passif = { total: 0 };
    for (const e of entries) {
      const type = (e as any).accountType || this.suggestAccountType(e.compte);
      if (type === 'ACTIF') actif.total += (e.debit || 0) - (e.credit || 0);
      if (type === 'PASSIF') passif.total += (e.credit || 0) - (e.debit || 0);
    }
    return { actif: actif.total, passif: passif.total, equilibre: actif.total - passif.total };
  }

  async getDeclarationTVA(tenantId: string) {
    const entries = await this.ecritureModel.find({ tenantId }).exec();
    let tvaCollectee = 0;
    let tvaDeductible = 0;
    for (const e of entries) {
      const type = (e as any).accountType || this.suggestAccountType(e.compte);
      if (type === 'TVA_COLLECTEE') tvaCollectee += (e.credit || 0);
      if (type === 'TVA_DEDUCTIBLE') tvaDeductible += (e.debit || 0);
    }
    return { tvaCollectee, tvaDeductible, tvaAPayer: tvaCollectee - tvaDeductible };
  }

  async getBalance(tenantId: string) {
    const entries = await this.ecritureModel.find({ tenantId }).exec();
    const grouped: Record<string, { compte: string; debit: number; credit: number }> = {};
    for (const e of entries) {
      const key = e.compte || 'INCONNU';
      if (!grouped[key]) grouped[key] = { compte: key, debit: 0, credit: 0 };
      grouped[key].debit += e.debit || 0;
      grouped[key].credit += e.credit || 0;
    }
    return Object.values(grouped).map((g) => ({
      ...g,
      solde: g.debit - g.credit,
    })).sort((a, b) => a.compte.localeCompare(b.compte));
  }
}
