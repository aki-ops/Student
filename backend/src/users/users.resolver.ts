import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums/user-role.enum';
import { CurrentUser } from 'common/decorators/current-user.decorator';

@UseGuards(GqlAuthGuard)
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'findAllUsers' })
  @Roles(UserRole.ADMIN)
  findAllUsers(@CurrentUser() user: User) {
    return this.usersService.findAll(user);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  updateUser(@Args('input') input: UpdateUserInput) {
    return this.usersService.update(input.id, input);
  }

  @Mutation(() => User)
  @Roles(UserRole.ADMIN)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }

  @Query(() => User, { name: 'findById' })
  findById(@Args('id', { type: () => String }) id: string) {
    return this.usersService.findById(id);
  }

}
