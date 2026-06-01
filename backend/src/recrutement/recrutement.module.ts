import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecrutementController } from './recrutement.controller';
import { RecrutementService } from './recrutement.service';
import { Offre, OffreSchema } from './schemas/offre.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Offre.name, schema: OffreSchema }])],
  controllers: [RecrutementController],
  providers: [RecrutementService],
})
export class RecrutementModule {}
