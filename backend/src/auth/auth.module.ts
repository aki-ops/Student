// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module'
import { UsersService } from 'src/users/users.service';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { StudentModule } from 'src/student/student.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'your_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule
  ],
  providers: [JwtStrategy, AuthResolver, AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
