import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { Bulletin, BulletinSchema } from './schemas/bulletin.schema';
@Module({
  imports: [MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }])],
  controllers: [PayrollController],
  providers: [PayrollService],
})
export class PayrollModule {}
