import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './role.schema';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: Model<RoleDocument>) {}

  async findAll(tenantId: string): Promise<Role[]> {
    return this.roleModel.find({ tenantId }).exec();
  }

  async findBySlug(tenantId: string, slug: string): Promise<Role | null> {
    return this.roleModel.findOne({ tenantId, slug }).exec();
  }

  async create(tenantId: string, data: Partial<Role>): Promise<Role> {
    const role = new this.roleModel({ ...data, tenantId });
    return role.save();
  }

  async update(id: string, tenantId: string, data: Partial<Role>): Promise<Role> {
    const role = await this.roleModel
      .findOneAndUpdate({ _id: id, tenantId }, data, { new: true })
      .exec();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.roleModel.findOneAndDelete({ _id: id, tenantId }).exec();
  }

  async seedDefaultRoles(tenantId: string): Promise<void> {
    const existing = await this.roleModel.countDocuments({ tenantId }).exec();
    if (existing > 0) return;

    const defaults = [
      {
        name: 'Super Admin',
        slug: 'super_admin',
        level: 1,
        isSystem: true,
        color: '#9333ea',
        permissions: [
          { module: 'dashboard', actions: { view: true, create: true, edit: true, delete: true } },
          { module: 'clients', actions: { view: true, create: true, edit: true, delete: true } },
          { module: 'settings', actions: { view: true, create: true, edit: true, delete: true } },
          { module: 'users', actions: { view: true, create: true, edit: true, delete: true } },
        ],
      },
      {
        name: 'Admin Plateforme',
        slug: 'platform_admin',
        level: 2,
        isSystem: true,
        color: '#6366f1',
        permissions: [
          'dashboard',
          'sales',
          'purchases',
          'accounting',
          'banking',
          'hr',
          'payroll',
          'projects',
          'clients',
          'contracts',
          'ged',
          'signature',
          'crm',
          'reporting',
          'settings',
          'users',
        ].map((m) => ({
          module: m,
          actions: {
            view: true,
            create: true,
            edit: true,
            delete: true,
            validate: true,
            export: true,
          },
        })),
      },
      {
        name: 'Directeur / CEO',
        slug: 'ceo',
        level: 3,
        isSystem: false,
        color: '#dc2626',
        permissions: [
          {
            module: 'dashboard',
            actions: { view: true, create: false, edit: false, delete: false },
          },
          {
            module: 'reporting',
            actions: { view: true, create: false, edit: false, delete: false, export: true },
          },
          {
            module: 'accounting',
            actions: { view: true, create: false, edit: false, delete: false, export: true },
          },
          { module: 'hr', actions: { view: true, create: false, edit: false, delete: false } },
          {
            module: 'projects',
            actions: { view: true, create: false, edit: false, delete: false },
          },
          { module: 'clients', actions: { view: true, create: false, edit: false, delete: false } },
        ],
      },
      {
        name: 'Comptable',
        slug: 'accountant',
        level: 5,
        isSystem: false,
        color: '#0891b2',
        permissions: [
          {
            module: 'dashboard',
            actions: { view: true, create: false, edit: false, delete: false },
          },
          {
            module: 'accounting',
            actions: { view: true, create: true, edit: true, delete: false, export: true },
          },
          { module: 'banking', actions: { view: true, create: true, edit: true, delete: false } },
          { module: 'sales', actions: { view: true, create: true, edit: true, delete: false } },
          { module: 'purchases', actions: { view: true, create: true, edit: true, delete: false } },
          { module: 'ged', actions: { view: true, create: true, edit: false, delete: false } },
        ],
      },
      {
        name: 'Responsable RH',
        slug: 'hr_manager',
        level: 4,
        isSystem: false,
        color: '#ea580c',
        permissions: [
          {
            module: 'dashboard',
            actions: { view: true, create: false, edit: false, delete: false },
          },
          {
            module: 'hr',
            actions: { view: true, create: true, edit: true, delete: true, validate: true },
          },
          { module: 'users', actions: { view: true, create: true, edit: true, delete: false } },
          { module: 'ged', actions: { view: true, create: true, edit: true, delete: false } },
        ],
      },
      {
        name: 'Responsable Commercial',
        slug: 'sales_manager',
        level: 4,
        isSystem: false,
        color: '#7c3aed',
        permissions: [
          {
            module: 'dashboard',
            actions: { view: true, create: false, edit: false, delete: false },
          },
          {
            module: 'sales',
            actions: { view: true, create: true, edit: true, delete: false, validate: true },
          },
          { module: 'clients', actions: { view: true, create: true, edit: true, delete: false } },
          { module: 'crm', actions: { view: true, create: true, edit: true, delete: true } },
          { module: 'projects', actions: { view: true, create: true, edit: true, delete: false } },
        ],
      },
    ];

    for (const role of defaults) {
      await this.create(tenantId, role);
    }
  }
}
