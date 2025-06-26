import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClassService } from './class.service';
import { Class } from './entities/class.entity';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums/user-role.enum';

@UseGuards(GqlAuthGuard)
@Resolver(() => Class)
export class ClassResolver {
  constructor(private readonly classService: ClassService) { }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Mutation(() => Class)
  createClass(@Args('createClassInput') createClassInput: CreateClassInput) {
    return this.classService.create(createClassInput);
  }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Mutation(() => Class)
  addStudentToClass(
    @Args('classId') classId: string,
    @Args('studentId') studentId: string
  ) {
    return this.classService.addStudentToClass(classId, studentId);
  }

  @Query(() => [Class], { name: 'class' })
  findAll() {
    return this.classService.findAll();
  }

  @Query(() => Class, { name: 'class' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.classService.findOne(id);
  }

  @Mutation(() => Class)
  updateClass(@Args('updateClassInput') updateClassInput: UpdateClassInput) {
    return this.classService.update(updateClassInput.id, updateClassInput);
  }

  @Mutation(() => Class)
  removeClass(@Args('id', { type: () => Int }) id: number) {
    return this.classService.remove(id);
  }
}
