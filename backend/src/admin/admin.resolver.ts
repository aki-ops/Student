import { Resolver, Query } from '@nestjs/graphql';
import { AdminService } from './admin.service';
import { UseGuards } from '@nestjs/common';
import { Roles } from 'common/decorators/roles.decorator';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'common/enums/user-role.enum';

@UseGuards(GqlAuthGuard)
@Roles(UserRole.ADMIN)
@Resolver()
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => User)
  async findAllUser(@CurrentUser() user : User): Promise<User[]> {
    return this.adminService.findAllUser(user);
  }

  @Query(() => String)
  async findStudent() {
    return this.adminService.findStudent();
  }

  @Query(() => String)
  async findTeacher() {
    return this.adminService.findTeacher();
  }
}
