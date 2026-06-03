import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntervenantsService } from './intervenants.service';
import { IntervenantsController } from './intervenants.controller';
import { Intervenant, IntervenantSchema } from './schemas/intervenant.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Intervenant.name, schema: IntervenantSchema }]),
    UsersModule,
  ],
  controllers: [IntervenantsController],
  providers: [IntervenantsService],
  exports: [IntervenantsService],
})
export class IntervenantsModule {}
