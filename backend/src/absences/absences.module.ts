import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbsencesController } from './absences.controller';
import { AbsencesService } from './absences.service';
import { Absence, AbsenceSchema } from './schemas/absence.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Absence.name, schema: AbsenceSchema },
    ]),
  ],
  controllers: [AbsencesController],
  providers: [AbsencesService],
  exports: [AbsencesService],
})
export class AbsencesModule {}