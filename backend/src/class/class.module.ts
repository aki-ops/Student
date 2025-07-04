import { Module } from '@nestjs/common';
import { ClassService } from './class.service';
import { ClassResolver } from './class.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Class, ClassSchema } from './entities/class.entity';
import { UsersModule } from '../users/users.module';

@Module({
  providers: [ClassResolver, ClassService],
  imports: [
    MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }]),
    UsersModule
  ],
  exports: [ClassService, ClassModule],
})
export class ClassModule {}
