import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createDto: any, tenantId: string): Promise<Project> {
    const project = new this.projectModel({
      ...createDto,
      tenantId,
      startDate: new Date(createDto.startDate),
      endDate: new Date(createDto.endDate),
    });
    return project.save();
  }

  async findAll(tenantId: string): Promise<Project[]> {
    return this.projectModel.find({ tenantId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Project> {
    const project = await this.projectModel.findOne({ _id: id, tenantId }).exec();
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateDto: any, tenantId: string): Promise<Project> {
    const updated = await this.projectModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.projectModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }
}

