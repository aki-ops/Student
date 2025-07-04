import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service'
import { CreateUserInput } from 'src/users/dto/create-user.input';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums/user-role.enum';


@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(
        username: string,
        pass: string,
    ): Promise<{ access_token: string, refresh_token: string }> {
        const user = await this.usersService.findByUsername(username);
        if (!user?.password || user.password !== pass) {
            throw new UnauthorizedException();
        }
        const payload = { id: user.id, username: user.username, role: user.role };

        const access_token = this.jwtService.sign(payload, {
            expiresIn: '15m',
          });
        
          const refresh_token = this.jwtService.sign(payload,{
            expiresIn: '7d',
          });

          await this.usersService.update(user.id, { refreshToken: refresh_token });

        return {
            access_token,
            refresh_token,
        };

    }
    async issueAccessToken(user: User): Promise<string> {
        return this.jwtService.signAsync(
          { id: user.id, username: user.username, role: user.role },
          {
            expiresIn: '15m',
          },
        );
      }
      

    @Roles(UserRole.ADMIN)
    async createUser(input: CreateUserInput): Promise<User> {
        return this.usersService.createUser(input);
    }

    async logout(userId: string): Promise<boolean> {
        await this.usersService.update(userId, { refreshToken: null });
        return true;
    }

}