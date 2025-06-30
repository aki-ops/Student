import { Injectable } from '@nestjs/common';
import { CreateTeacherWithUserInput } from './dto/create-teacher.input';
import { UsersService } from '../users/users.service';
import { Teacher } from './entities/teacher.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from 'common/enums/user-role.enum';

@Injectable()
export class TeacherService {

  constructor(
      @InjectModel(Teacher.name)
      private readonly teacherModel: Model<Teacher>,

      private readonly UsersService: UsersService,
    ) { }


  // src/student/student.service.ts
  async createTeacherWithUser(input: CreateTeacherWithUserInput): Promise<Teacher> {
    // 1. Create student first
    const teacher = new this.teacherModel({
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
