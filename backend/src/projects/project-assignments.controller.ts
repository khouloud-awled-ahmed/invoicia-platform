import { Controller, Get, Post, Patch, Param, Body, UseGuards, Delete } from '@nestjs/common';
import { ProjectAssignmentsService } from './project-assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BadRequestException } from '@nestjs/common';

@Controller('projects/assignments')
@UseGuards(JwtAuthGuard)
export class ProjectAssignmentsController {
  constructor(private readonly assignmentsService: ProjectAssignmentsService) {}

  /**
   * Crée une affectation (Admin/RH uniquement)
   */
  @Post()
  async create(
    @Body() createDto: {
      userId: string;
      projectId: string;
      startDate: string;
      endDate?: string;
      validatorId?: string;
      dailyRate?: number;
    },
    @CurrentUser() user: any,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID requis');
    }

    // Vérifier les permissions (TENANT_ADMIN, RH, ou MANAGER)
    if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
      throw new BadRequestException('Accès réservé aux administrateurs et RH');
    }

    return this.assignmentsService.create(
      createDto.userId,
      createDto.projectId,
      new Date(createDto.startDate),
      user.tenantId,
      createDto.endDate ? new Date(createDto.endDate) : undefined,
      createDto.validatorId,
      createDto.dailyRate,
    );
  }

  /**
   * Récupère les affectations d'un utilisateur
   */
  @Get('my-assignments')
  async getMyAssignments(@CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID requis');
    }
    return this.assignmentsService.findByUser(user.userId || user._id, user.tenantId);
  }

  /**
   * Récupère les affectations d'un projet
   */
  @Get('project/:projectId')
  async getByProject(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID requis');
    }
    return this.assignmentsService.findByProject(projectId, user.tenantId);
  }

  /**
   * Met à jour une affectation
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: {
      endDate?: string;
      validatorId?: string;
      dailyRate?: number;
      status?: string;
    },
    @CurrentUser() user: any,
  ) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID requis');
    }

    if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
      throw new BadRequestException('Accès réservé aux administrateurs et RH');
    }

    return this.assignmentsService.update(
      id,
      {
        ...updateDto,
        endDate: updateDto.endDate ? new Date(updateDto.endDate) : undefined,
      },
      user.tenantId,
    );
  }

  /**
   * Termine une affectation
   */
  @Delete(':id')
  async endAssignment(@Param('id') id: string, @CurrentUser() user: any) {
    if (!user.tenantId) {
      throw new BadRequestException('Tenant ID requis');
    }

    if (!['TENANT_ADMIN', 'RH', 'MANAGER'].includes(user.role)) {
      throw new BadRequestException('Accès réservé aux administrateurs et RH');
    }

    return this.assignmentsService.endAssignment(id, user.tenantId);
  }
}
