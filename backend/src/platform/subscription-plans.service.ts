import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectModel(SubscriptionPlan.name) private planModel: Model<SubscriptionPlanDocument>,
  ) {}

  async create(createPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    // Vérifier que le nom n'existe pas déjà
    const existing = await this.planModel.findOne({ name: createPlanDto.name }).exec();
    if (existing) {
      throw new BadRequestException(`Un plan avec le nom "${createPlanDto.name}" existe déjà`);
    }

    const plan = new this.planModel({
      ...createPlanDto,
      currency: createPlanDto.currency || 'EUR',
      maxUsers: createPlanDto.maxUsers || 10,
      isActive: createPlanDto.isActive !== undefined ? createPlanDto.isActive : true,
    });

    return plan.save();
  }

  async findAll(): Promise<SubscriptionPlan[]> {
    return this.planModel.find().sort({ price: 1 }).exec();
  }

  async findActive(): Promise<SubscriptionPlan[]> {
    return this.planModel.find({ isActive: true }).sort({ price: 1 }).exec();
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planModel.findById(id).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async update(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    const plan = await this.planModel.findByIdAndUpdate(id, updatePlanDto, { new: true }).exec();
    if (!plan) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
    return plan;
  }

  async remove(id: string): Promise<void> {
    const result = await this.planModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Plan with ID ${id} not found`);
    }
  }
}
