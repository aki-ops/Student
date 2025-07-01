import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationSchema } from './entities/notification.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ClassModule } from '../class/class.module';
import { Notification } from './entities/notification.entity';
import { User } from 'src/users/entities/user.entity';
import { UserSchema } from 'src/users/entities/user.entity';

@Module({
  providers: [NotificationResolver, NotificationService],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
    ClassModule,
  ],
})
export class NotificationModule {}
