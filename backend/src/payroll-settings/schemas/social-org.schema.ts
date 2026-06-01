import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SocialOrgDocument = SocialOrg & Document;

@Schema({ timestamps: true })
export class SocialOrg {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop()
  contractId?: string;

  @Prop()
  affiliationId?: string;

  @Prop({ type: String, ref: 'Tenant', required: true })
  tenantId: string;
}

export const SocialOrgSchema = SchemaFactory.createForClass(SocialOrg);
SocialOrgSchema.index({ tenantId: 1 });
SocialOrgSchema.index({ tenantId: 1, type: 1 });
