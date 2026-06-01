import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;
  @Prop({ required: true })
  password: string;
 @Prop({
    required: true,
    enum: ['PLATFORM_ADMIN', 'TENANT_ADMIN', 'USER', 'CONSULTANT', 'MANAGER', 'RH'],
    default: 'USER',
  })
  role: string;
  @Prop({ type: String, ref: 'Tenant', required: false })
  tenantId?: string;
  @Prop()
  avatar?: string;
  @Prop({ default: false })
  mfaEnabled: boolean;
  @Prop()
  mfaSecret?: string;
  @Prop({ default: true })
  isActive: boolean;
  @Prop()
  lastLogin?: Date;
  @Prop()
  phone?: string;
  @Prop({ default: false })
  isPhoneVerified: boolean;
  @Prop({ default: false })
  isEmailVerified: boolean;
  @Prop({ default: '' })
  roleSlug?: string;
  @Prop({ type: Object })
  metadata?: Record<string, any>;
  // Password reset (stored as hash + expiry, never store raw token)
  @Prop()
  resetPasswordTokenHash?: string;
  @Prop()
  resetPasswordExpiresAt?: Date;
}
export const UserSchema = SchemaFactory.createForClass(User);

