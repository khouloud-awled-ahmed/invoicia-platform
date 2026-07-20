import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Asset, AssetDocument } from './schemas/asset.schema';

@Injectable()
export class AssetsService {
  constructor(@InjectModel(Asset.name) private assetModel: Model<AssetDocument>) {}

  async create(dto: any, tenantId: string) {
    return new this.assetModel({ ...dto, tenantId }).save();
  }

  async remove(id: string, tenantId: string) {
    return this.assetModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  private computeValues(asset: any) {
    const purchaseAmount = asset.purchaseAmount || 0;
    const years = asset.depreciationYears || 1;
    const monthlyDepreciation = purchaseAmount / (years * 12);

    const purchaseDate = new Date(asset.purchaseDate);
    const now = new Date();
    const monthsElapsed = Math.max(
      0,
      (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth()),
    );
    const totalDepreciated = Math.min(purchaseAmount, monthlyDepreciation * monthsElapsed);
    const currentValue = Math.max(0, purchaseAmount - totalDepreciated);

    return { monthlyDepreciation, currentValue };
  }

  async findAll(tenantId: string) {
    const assets = await this.assetModel.find({ tenantId }).exec();
    return assets.map((a: any) => {
      const { monthlyDepreciation, currentValue } = this.computeValues(a);
      return {
        id: a._id.toString(),
        name: a.name,
        category: a.category,
        purchaseDate: a.purchaseDate,
        purchaseAmount: a.purchaseAmount,
        depreciationMethod: a.depreciationMethod,
        depreciationYears: a.depreciationYears,
        currentValue,
        monthlyDepreciation,
      };
    });
  }

  async getSummary(tenantId: string) {
    const assets = await this.findAll(tenantId);
    const totalGross = assets.reduce((s, a) => s + a.purchaseAmount, 0);
    const totalNet = assets.reduce((s, a) => s + a.currentValue, 0);
    const totalMonthlyDepreciation = assets.reduce((s, a) => s + a.monthlyDepreciation, 0);
    return { totalGross, totalNet, totalMonthlyDepreciation };
  }
}