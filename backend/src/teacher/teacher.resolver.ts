import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TeacherService } from './teacher.service';
import { CreateTeacherWithUserInput } from './dto/create-teacher.input';
import { User } from '../users/entities/user.entity';

@Resolver(() => User)
export class TeacherResolver {
  constructor(private readonly teacherService: TeacherService) {}

}
