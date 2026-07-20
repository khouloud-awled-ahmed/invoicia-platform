import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssetDocument = Asset & Document;

@Schema({ timestamps: true })
export class Asset {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, type: Date })
  purchaseDate: Date;

  @Prop({ required: true })
  purchaseAmount: number;

  @Prop({ required: true, enum: ['linear', 'degressive'] })
  depreciationMethod: string;

  @Prop({ required: true })
  depreciationYears: number;

  @Prop({ required: true })
  tenantId: string;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
AssetSchema.index({ tenantId: 1 });