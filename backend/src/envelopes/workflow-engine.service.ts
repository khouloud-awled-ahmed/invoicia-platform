import { Injectable, Logger } from '@nestjs/common';
import {
  EnvelopeDocument,
  Recipient,
  RecipientStatus,
  RecipientRole,
  EnvelopeStatus,
} from './schemas/envelope.schema';
import { EmailService } from './email.service';

@Injectable()
export class WorkflowEngine {
  private readonly logger = new Logger(WorkflowEngine.name);

  constructor(private emailService: EmailService) {}

  async processEnvelopeSent(envelope: EnvelopeDocument): Promise<void> {
    // Trouver le premier signataire selon l'ordre de routage
    const firstRecipient = envelope.recipients.find(
      (r) => r.routingOrder === envelope.currentRoutingOrder && r.role === RecipientRole.SIGNER,
    );

    if (!firstRecipient) {
      this.logger.warn(
        `Aucun signataire trouvé pour l'ordre ${envelope.currentRoutingOrder} dans l'enveloppe ${envelope._id}`,
      );
      return;
    }

    firstRecipient.status = RecipientStatus.SENT;
    envelope.status = EnvelopeStatus.IN_PROGRESS;

    envelope.auditTrail.push({
      timestamp: new Date(),
      action: 'RECIPIENT_NOTIFIED',
      actorEmail: firstRecipient.email,
      actorName: firstRecipient.name,
      metadata: { routingOrder: firstRecipient.routingOrder },
    });

    await envelope.save();

    await this.emailService.sendSignatureRequestEmail(envelope, firstRecipient);
    this.logger.log(
      `Email envoyé au premier signataire: ${firstRecipient.email} (ordre ${firstRecipient.routingOrder})`,
    );
  }

  async processNextSigner(envelope: EnvelopeDocument, signedRecipient: Recipient): Promise<void> {
    // Trouver le prochain signataire dans l'ordre de routage
    const nextOrder = signedRecipient.routingOrder + 1;
    const nextRecipient = envelope.recipients.find(
      (r) => r.routingOrder === nextOrder && r.role === RecipientRole.SIGNER,
    );

    if (nextRecipient) {
      // Il y a un signataire suivant
      nextRecipient.status = RecipientStatus.SENT;
      envelope.currentRoutingOrder = nextOrder;

      envelope.auditTrail.push({
        timestamp: new Date(),
        action: 'ROUTING_ADVANCED',
        actorEmail: signedRecipient.email,
        actorName: signedRecipient.name,
        metadata: {
          fromOrder: signedRecipient.routingOrder,
          toOrder: nextOrder,
          nextRecipientEmail: nextRecipient.email,
        },
      });

      await envelope.save();
      await this.emailService.sendSignatureRequestEmail(envelope, nextRecipient);
      this.logger.log(
        `Email envoyé au signataire suivant: ${nextRecipient.email} (ordre ${nextOrder})`,
      );
    } else {
      // Plus de signataires, vérifier si tous ont signé
      const allSigners = envelope.recipients.filter((r) => r.role === RecipientRole.SIGNER);
      const allSigned = allSigners.every((r) => r.status === RecipientStatus.SIGNED);

      if (allSigned) {
        // Tous les signataires ont signé, compléter l'enveloppe
        await this.processEnvelopeCompleted(envelope);
      } else {
        this.logger.warn(
          `Pas de signataire suivant pour l'ordre ${nextOrder}, mais tous n'ont pas signé`,
        );
      }
    }
  }

  async processEnvelopeCompleted(envelope: EnvelopeDocument): Promise<void> {
    // Envoyer un email à tous les participants (signataires et viewers)
    const allParticipants = envelope.recipients;

    for (const participant of allParticipants) {
      await this.emailService.sendEnvelopeCompletedEmail(envelope, participant);
    }

    this.logger.log(
      `Enveloppe ${envelope._id} complétée, emails envoyés à ${allParticipants.length} participants`,
    );
  }

  async processEnvelopeRefused(
    envelope: EnvelopeDocument,
    refusingRecipient: Recipient,
  ): Promise<void> {
    // Marquer l'enveloppe comme VOIDED
    envelope.status = EnvelopeStatus.VOIDED;

    envelope.auditTrail.push({
      timestamp: new Date(),
      action: 'ENVELOPE_REFUSED',
      actorEmail: refusingRecipient.email,
      actorName: refusingRecipient.name,
      ipAddress: refusingRecipient.ipAddress,
      metadata: {
        reason: refusingRecipient.refusalReason,
        routingOrder: refusingRecipient.routingOrder,
      },
    });

    await envelope.save();

    // Notifier tous les participants du refus (y compris ceux qui ont déjà signé)
    const allParticipants = envelope.recipients.filter((r) => r.id !== refusingRecipient.id);

    for (const participant of allParticipants) {
      await this.emailService.sendEnvelopeRefusedEmail(envelope, participant, refusingRecipient);
    }

    // Notifier aussi le créateur
    await this.emailService.sendEnvelopeRefusedNotificationToCreator(envelope, refusingRecipient);

    this.logger.log(
      `Enveloppe ${envelope._id} refusée par ${refusingRecipient.email} (ordre ${refusingRecipient.routingOrder})`,
    );
  }
}
