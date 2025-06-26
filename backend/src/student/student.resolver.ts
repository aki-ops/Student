import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { StudentService } from './student.service';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver()
export class StudentResolver {
  constructor(private readonly studentService: StudentService) {}

  @Query(() => User)
  async find(@CurrentUser() user: User): Promise<User[]> {
    return this.studentService.find(user);
  }
}
