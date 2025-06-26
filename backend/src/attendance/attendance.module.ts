import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceResolver } from './attendance.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [AttendanceResolver, AttendanceService],
  imports: [
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema }]),
    UsersModule
  ],
})
export class AttendanceModule {}
