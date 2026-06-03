import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) slug: string;
  @Prop() description: string;
  @Prop({ default: '#6b7280' }) color: string;
  @Prop({ default: 5 }) level: number;
  @Prop({ default: false }) isSystem: boolean;
  @Prop({ default: true }) isActive: boolean;
  @Prop({ required: true }) tenantId: string;
  @Prop({ type: Array, default: [] }) permissions: any[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ slug: 1, tenantId: 1 }, { unique: true });
