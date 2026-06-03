import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvelopesController } from './envelopes.controller';
import { EnvelopesService } from './envelopes.service';
import { Envelope, EnvelopeSchema } from './schemas/envelope.schema';
import { WorkflowEngine } from './workflow-engine.service';
import { EmailService } from './email.service';
import { CertificateService } from './certificate.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Envelope.name, schema: EnvelopeSchema }])],
  controllers: [EnvelopesController],
  providers: [EnvelopesService, WorkflowEngine, EmailService, CertificateService],
  exports: [EnvelopesService],
})
export class EnvelopesModule {}
