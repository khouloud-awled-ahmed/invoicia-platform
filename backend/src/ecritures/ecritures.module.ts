import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EcrituresController } from './ecritures.controller';
import { EcrituresService } from './ecritures.service';
import { Ecriture, EcritureSchema } from './schemas/ecriture.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Ecriture.name, schema: EcritureSchema }])],
  controllers: [EcrituresController],
  providers: [EcrituresService],
})
export class EcrituresModule {}
