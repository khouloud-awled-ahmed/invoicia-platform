import { Model } from 'mongoose';
import { SubscriptionPlan, SubscriptionPlanDocument } from './schemas/subscription-plan.schema';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
export declare class SubscriptionPlansService {
    private planModel;
    constructor(planModel: Model<SubscriptionPlanDocument>);
    create(createPlanDto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan>;
    findAll(): Promise<SubscriptionPlan[]>;
    findActive(): Promise<SubscriptionPlan[]>;
    findOne(id: string): Promise<SubscriptionPlan>;
    update(id: string, updatePlanDto: UpdateSubscriptionPlanDto): Promise<SubscriptionPlan>;
    remove(id: string): Promise<void>;
}
