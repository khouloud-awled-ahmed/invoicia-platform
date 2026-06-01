import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientContactDocument = ClientContact & Document;

@Schema({ _id: false })
export class ClientContact {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop({
    enum: ['principal', 'commercial', 'comptable', 'technique', 'autre'],
    default: 'autre',
    required: true,
  })
  type: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop()
  position?: string;

  @Prop()
  notes?: string;
}

export const ClientContactSchema = SchemaFactory.createForClass(ClientContact);
