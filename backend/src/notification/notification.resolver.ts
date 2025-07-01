import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'common/guards/gql-auth.guard';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { Class } from 'src/class/entities/class.entity';


// src/notification/notification.resolver.ts
@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) { }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      throw new Error('Chỉ giáo viên hoặc admin mới được gửi thông báo.');
    }
    return this.notificationService.create(input, user._id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeNotification(@Args('id', { type: () => ID }) id: string, @CurrentUser() user: any) {
    const noti = await this.notificationService.findById(id);
    if (!noti) throw new Error('Không tìm thấy thông báo');
    if (user.role !== 'ADMIN' && String(noti.sender) !== String(user._id)) {
      throw new Error('Bạn không có quyền xóa thông báo này');
    }
    await this.notificationService.remove(id);
    return true;
  }

  @Query(() => [Notification])
  @UseGuards(GqlAuthGuard)
  async getMyNotifications(@CurrentUser() user: any) {
    // Từ user, lấy danh sách lớp họ đang học
    const student: any = await this.userModel.findById(user._id).populate('classes');
    const classIds = student?.classes?.map((c: any) => c._id.toString()) || [];

    return this.notificationService.findForUser(user._id, classIds);
  }
}


