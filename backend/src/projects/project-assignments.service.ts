import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectAssignment, ProjectAssignmentDocument } from './schemas/project-assignment.schema';
import { Project, ProjectDocument } from './schemas/project.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class ProjectAssignmentsService {
  constructor(
    @InjectModel(ProjectAssignment.name) private assignmentModel: Model<ProjectAssignmentDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  /**
   * Crée une affectation de consultant sur un projet
   */
  async create(
    userId: string,
    projectId: string,
    startDate: Date,
    tenantId: string,
    endDate?: Date,
    validatorId?: string,
    dailyRate?: number,
  ): Promise<ProjectAssignmentDocument> {
    // Vérifier que le projet existe
    const project = await this.projectModel.findById(projectId).exec();
    if (!project || project.tenantId !== tenantId) {
      throw new NotFoundException('Project not found');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userModel.findById(userId).exec();
    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('User not found');
    }

    // Vérifier les conflits d'affectation
    const conflictingAssignment = await this.assignmentModel
      .findOne({
        userId,
        projectId,
        status: 'ACTIVE',
        $or: [{ endDate: { $gte: startDate } }, { endDate: null }],
      })
      .exec();

    if (conflictingAssignment) {
      throw new BadRequestException('User is already assigned to this project during this period');
    }

    // Récupérer le nom du validateur si fourni
    let validatorName: string | undefined;
    if (validatorId) {
      const validator = await this.userModel.findById(validatorId).exec();
      validatorName = validator?.name;
    }

    const assignment = new this.assignmentModel({
      userId,
      projectId,
      projectName: project.name,
      startDate,
      endDate,
      validatorId,
      validatorName,
      dailyRate: dailyRate || 0,
      status: 'ACTIVE',
      tenantId,
    });

    return assignment.save();
  }

  /**
   * Récupère toutes les affectations actives d'un utilisateur
   */
  async findByUser(
    userId: string,
    tenantId: string,
    includeEnded = false,
  ): Promise<ProjectAssignmentDocument[]> {
    const query: any = { userId, tenantId };
    if (!includeEnded) {
      query.status = 'ACTIVE';
    }
    return this.assignmentModel.find(query).sort({ startDate: -1 }).exec();
  }

  /**
   * Récupère toutes les affectations d'un projet
   */
  async findByProject(projectId: string, tenantId: string): Promise<ProjectAssignmentDocument[]> {
    return this.assignmentModel
      .find({ projectId, tenantId })
      .populate('userId', 'name email')
      .populate('validatorId', 'name email')
      .sort({ startDate: -1 })
      .exec();
  }

  /**
   * Met à jour une affectation
   */
  async update(
    id: string,
    updateDto: {
      endDate?: Date;
      validatorId?: string;
      dailyRate?: number;
      status?: string;
    },
    tenantId: string,
  ): Promise<ProjectAssignmentDocument> {
    const assignment = await this.assignmentModel.findOne({ _id: id, tenantId }).exec();
    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (updateDto.validatorId) {
      const validator = await this.userModel.findById(updateDto.validatorId).exec();
      updateDto['validatorName'] = validator?.name;
    }

    Object.assign(assignment, updateDto);
    return assignment.save();
  }

  /**
   * Termine une affectation
   */
  async endAssignment(id: string, tenantId: string): Promise<ProjectAssignmentDocument> {
    return this.update(id, { status: 'ENDED', endDate: new Date() }, tenantId);
  }

  /**
   * Récupère les affectations actives pour un utilisateur à une date donnée
   */
  async findActiveAssignmentsForDate(
    userId: string,
    date: Date,
    tenantId: string,
  ): Promise<ProjectAssignmentDocument[]> {
    return this.assignmentModel
      .find({
        userId,
        tenantId,
        status: 'ACTIVE',
        startDate: { $lte: date },
        $or: [{ endDate: { $gte: date } }, { endDate: null }],
      })
      .populate('projectId', 'name code type')
      .exec();
  }
}
