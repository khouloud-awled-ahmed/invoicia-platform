import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CV, CVDocument } from './schemas/cv.schema';
import { UserSyncService } from '../users/user-sync.service';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(CV.name) private cvModel: Model<CVDocument>,
    private userSyncService: UserSyncService,
  ) {}

  async create(createDto: any, tenantId: string): Promise<Employee> {
    const employee = new this.employeeModel({
      ...createDto,
      tenantId,
      email: createDto.email?.toLowerCase(),
    });

    const savedEmployee = await employee.save();

    // Créer automatiquement un User associé
    try {
      const role = createDto.role || 'CONSULTANT'; // Par défaut CONSULTANT, peut être MANAGER ou RH
      const user = await this.userSyncService.createUserFromEmployee(
        savedEmployee.email,
        savedEmployee.firstName,
        savedEmployee.lastName,
        tenantId,
        role,
      );

      // Lier l'Employee au User créé
      savedEmployee.userId = user._id.toString();
      await savedEmployee.save();
    } catch (error) {
      // Si la création du User échoue, supprimer l'Employee créé et renvoyer l'erreur
      await this.employeeModel.findByIdAndDelete(savedEmployee._id).exec();
      this.logger.error('Erreur lors de la création automatique du User:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new BadRequestException(`Impossible de créer le compte utilisateur: ${errorMessage}`);
    }

    return savedEmployee;
  }

  async findAll(tenantId: string): Promise<Employee[]> {
    return this.employeeModel.find({ tenantId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Employee> {
    const employee = await this.employeeModel.findOne({ _id: id, tenantId }).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateDto: any, tenantId: string): Promise<Employee> {
    const employee = await this.findOne(id, tenantId);
    
    const updated = await this.employeeModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    // Mettre à jour le User associé si nécessaire
    if (employee.userId && (updateDto.firstName || updateDto.lastName || updateDto.email)) {
      try {
        await this.userSyncService.updateUserFromEmployee(
          employee.userId,
          updated.firstName,
          updated.lastName,
          updateDto.email,
        );
      } catch (error) {
        this.logger.error('Erreur lors de la mise à jour du User:', error);
      }
    }

    // Gérer l'activation/désactivation
    if (updateDto.status !== undefined && employee.userId) {
      if (updateDto.status === 'active') {
        await this.userSyncService.activateUserFromEmployee(employee.userId);
      } else if (updateDto.status === 'inactive') {
        await this.userSyncService.deactivateUserFromEmployee(employee.userId);
      }
    }

    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.employeeModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
  }

  /** Sauvegarde un CV parsé (nom, email, texte brut). Aucune vérification externe. */
  async createCV(
    tenantId: string,
    data: { fileName: string; name?: string; email?: string; rawText: string },
  ): Promise<CVDocument> {
    const cv = new this.cvModel({ ...data, tenantId });
    return cv.save();
  }

  async findAllCVs(tenantId: string): Promise<CVDocument[]> {
    return this.cvModel.find({ tenantId }).sort({ createdAt: -1 }).exec();
  }
}

