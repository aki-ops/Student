import { Resolver, Args, Mutation, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginResponse, User } from '../users/entities/user.entity'
import { CreateUserInput, LoginInput } from 'src/users/dto/create-user.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { JwtRefreshStrategy } from './jwt.strategy';


@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => LoginResponse)
  async SignIn(@Args('input') input: LoginInput, @Context() context): Promise<LoginResponse> {
    const { access_token, refresh_token } = await this.authService.signIn(input.username, input.password);
    context.res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });
    context.res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token, refresh_token };
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(@CurrentUser() user: User): Promise<boolean> {
    return this.authService.logout(user.id);
  }

  @Mutation(() => String, { name: 'refreshAccessToken' })
  @UseGuards(JwtRefreshStrategy)
  async refreshAccessToken(@CurrentUser() user: User, @Context() context): Promise<string> {
    const access_token = await this.authService.issueAccessToken(user);
    context.res.cookie('access_token', access_token, {
      httpOnly: true,
      sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
    });
    return access_token;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async current_User(@CurrentUser() user: User) {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    }
  }

  @Mutation(() => User)
  async CreateUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.authService.createUser(input);
  }
}
