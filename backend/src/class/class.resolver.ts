import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ClassService } from './class.service';
import { Class } from './entities/class.entity';
import { CreateClassInput } from './dto/create-class.input';
import { UpdateClassInput } from './dto/update-class.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from 'common/enums/user-role.enum';
import { CurrentUser } from 'common/decorators/current-user.decorator';

@UseGuards(GqlAuthGuard)
@Resolver(() => Class)
export class ClassResolver {
  constructor(private readonly classService: ClassService) { }

  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @Mutation(() => Class)
  createClass(
    @Args('createClassInput') createClassInput: CreateClassInput,
    @CurrentUser() currentUser: any
  ) {
    // Nếu là TEACHER, tự động gán teacherId là ID của họ
    if (currentUser.role === UserRole.TEACHER) {
      createClassInput.teacherId = currentUser.id;
    }
    
    // Đảm bảo teacher field cũng được set
    if (createClassInput.teacherId) {
      (createClassInput as any).teacher = createClassInput.teacherId;
    }
    
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

  @Query(() => [Class], { name: 'getAllClasses' })
  getAllClasses() {
    return this.classService.findAll();
  }

  @Query(() => [Class], { name: 'getMyClasses' })
  @Roles(UserRole.STUDENT)
  getMyClasses(@CurrentUser() currentUser: any) {
    return this.classService.findClassesByStudentId(currentUser.id);
  }

  @Query(() => Class, { name: 'getClassById' })
  findOne(@Args('id') id: string) {
    return this.classService.findOne(id);
  }

  @Mutation(() => Class)
  updateClass(@Args('updateClassInput') updateClassInput: UpdateClassInput) {
    return this.classService.update(updateClassInput.id.toString(), updateClassInput);
  }

  @Mutation(() => Class)
  removeClass(@Args('id') id: string) {
    return this.classService.remove(id);
  }
}
