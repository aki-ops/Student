import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TeacherService } from './teacher.service';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherWithUserInput } from './dto/create-teacher.input';

@Resolver(() => Teacher)
export class TeacherResolver {
  constructor(private readonly teacherService: TeacherService) {}

  @Mutation(() => Teacher)
  createStudent(@Args('createStudentInput') createStudentInput: CreateTeacherWithUserInput) {
    return this.teacherService.createTeacherWithUser(createStudentInput);
  }

}
