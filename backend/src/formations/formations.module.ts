import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FormationsController } from './formations.controller';
import { FormationsService } from './formations.service';
import { Formation, FormationSchema } from './schemas/formation.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Formation.name, schema: FormationSchema }])],
  controllers: [FormationsController],
  providers: [FormationsService],
})
export class FormationsModule {}
