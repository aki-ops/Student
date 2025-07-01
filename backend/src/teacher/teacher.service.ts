import { Injectable } from '@nestjs/common';
import { CreateTeacherWithUserInput } from './dto/create-teacher.input';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from 'common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TeacherService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

      private readonly UsersService: UsersService,
    ) { }


  // src/student/student.service.ts
  async createTeacherWithUser(input: CreateTeacherWithUserInput): Promise<User> {
    // 1. Create student first
    const teacher = new this.userModel({
      fullName: input.fullName,
      birthDate: input.birthDate,
    });
    const savedTeacher = await teacher.save();

    await this.UsersService.createUser({
      username: input.username,
      password: input.password, // should be hashed before saving
      fullName: input.fullName,
      role: UserRole.TEACHER,
    });

    return savedTeacher;
  }

}
