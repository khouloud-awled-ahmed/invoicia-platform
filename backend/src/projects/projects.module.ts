import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project, ProjectSchema } from './schemas/project.schema';
import { ProjectAssignment, ProjectAssignmentSchema } from './schemas/project-assignment.schema';
import { ProjectAssignmentsService } from './project-assignments.service';
import { ProjectAssignmentsController } from './project-assignments.controller';
import { IntervenantsModule } from '../intervenants/intervenants.module';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: ProjectAssignment.name, schema: ProjectAssignmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
    IntervenantsModule,
    UsersModule,
  ],
  controllers: [
    ProjectsController,
    ProjectAssignmentsController,
  ],
  providers: [
    ProjectsService,
    ProjectAssignmentsService,
  ],
  exports: [
    ProjectsService,
    ProjectAssignmentsService,
  ],
})
export class ProjectsModule {}

