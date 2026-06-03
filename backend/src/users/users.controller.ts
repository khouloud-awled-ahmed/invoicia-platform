import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto, @CurrentUser() currentUser: any) {
    if (!createUserDto.tenantId && currentUser?.tenantId) {
      createUserDto.tenantId = currentUser.tenantId;
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query('tenantId') tenantId?: string, @CurrentUser() currentUser?: any) {
    if (currentUser?.role === 'PLATFORM_ADMIN') {
      return this.usersService.findAll(tenantId);
    }
    return this.usersService.findAll(currentUser?.tenantId);
  }

  @Get('me/profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
