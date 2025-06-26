import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentResolver } from './student.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [StudentResolver, StudentService],
  imports: [UsersModule],
  exports: [StudentModule, StudentService]
})
export class StudentModule { }
