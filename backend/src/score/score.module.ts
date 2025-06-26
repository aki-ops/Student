import { Module } from '@nestjs/common';
import { ScoreService } from './score.service';
import { ScoreResolver } from './score.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Score, ScoreSchema } from './entities/score.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { Class, ClassSchema } from '../class/entities/class.entity';
import { UsersModule } from '../users/users.module';
import { ClassModule } from '../class/class.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Score.name, schema: ScoreSchema },
      { name: User.name, schema: UserSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
      UsersModule,
      ClassModule
  ],
  providers: [ScoreResolver, ScoreService],
})
export class ScoreModule { }
