import { Module } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { TeacherResolver } from './teacher.resolver';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/entities/user.entity';


@Module({
  providers: [TeacherResolver, TeacherService],
  exports: [TeacherModule, TeacherService],
  imports: [UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ Cần dòng này
    UsersModule, // nếu bạn dùng UsersService
  ],
})
export class TeacherModule { }
