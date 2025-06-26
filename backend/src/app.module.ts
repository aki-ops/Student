import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { TeacherModule } from './teacher/teacher.module';
import { ScoreModule } from './score/score.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AdminModule } from './admin/admin.module';
import { ClassModule } from './class/class.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL || ''),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: () => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        context: ({ req }) => {
          return { req }; // phải có dòng này để GqlAuthGuard dùng được context.req
        },
        playground: true,
        debug: false,
        introspection: true,
      }),
    }),
    StudentModule,
    TeacherModule,
    ScoreModule,
    AttendanceModule,
    AuthModule,
    UsersModule,
    AdminModule,
    ClassModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
