import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceInput } from './dto/create-attendance.input';
import { UpdateAttendanceInput } from './dto/update-attendance.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@UseGuards(GqlAuthGuard)
@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
  ) {}


  @Mutation(() => Attendance)
  createAttendance(@Args('input') input: CreateAttendanceInput) {
    return this.attendanceService.create(input);
  }

  @Query(() => [Attendance], { name: 'attendance' })
  async findAll(): Promise<Attendance[]> {
  return this.attendanceModel
    .find()
    .populate('classId')
    .populate('records.studentId')
    .exec();
}


  @Query(() => [Attendance])
  getAttendanceByClass(@Args('classId') classId: string) {
    return this.attendanceService.getByClass(classId);
  }

  @Query(() => [Attendance])
  getAttendanceByStudent(@CurrentUser() user: User) {
    return this.attendanceService.getByStudent(user.id);
  }

  @Mutation(() => Attendance)
  updateAttendance(@Args('updateAttendanceInput') updateAttendanceInput: UpdateAttendanceInput) {
    return this.attendanceService.update(updateAttendanceInput.id, updateAttendanceInput);
  }

  @Mutation(() => Attendance)
  removeAttendance(@Args('id', { type: () => String }) id: string) {
    return this.attendanceService.remove(id);
  }
}
