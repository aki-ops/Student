import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, User } from '../users/entities/user.entity'
import { CreateUserInput, LoginInput } from 'src/users/dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}
  
  @Mutation(() => LoginResponse)
  async SignIn(@Args('input') input: LoginInput): Promise <LoginResponse> {
      return this.authService.signIn(input.username, input.password);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
    async current_User(@CurrentUser() user){
      return user.role;
    }

  @Mutation(() => User)
  async CreateUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.authService.createUser(input);
  }
}
