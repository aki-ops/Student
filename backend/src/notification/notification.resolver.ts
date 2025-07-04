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
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class NotificationWithClassInfo extends Notification {
  @Field({ nullable: true })
  className?: string;

  @Field({ nullable: true })
  teacherName?: string;
}

// src/notification/notification.resolver.ts
@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Class.name)
    private readonly classModel: Model<Class>,
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

    return this.notificationService.create(input, user.id);
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

  @Query(() => [NotificationWithClassInfo])
  @UseGuards(GqlAuthGuard)
  async getMyNotifications(@CurrentUser() user: any) {
    let userId: string | undefined;
    if (user && user._id) {
      userId = typeof user._id === 'string' ? user._id : user._id.toString();
    } else if (user && user.id) {
      userId = typeof user.id === 'string' ? user.id : user.id.toString();
    } else {
      return [];
    }
    // Populate teacher khi lấy class
    const classes = await this.classModel.find({ studentIds: userId })
      .populate('teacher', 'id username fullName role')
      .exec();
    const classIds = classes.map((c: any) => c._id.toString());
    const notis = await this.notificationService.findForUser(classIds);

    // Map thêm className và teacherName
    const classMap = new Map();
    for (const cls of classes) {
      classMap.set(cls.id.toString(), cls);
    }
    const result: NotificationWithClassInfo[] = notis.map((noti: any) => {
      const obj = noti.toObject ? noti.toObject() : noti;
      const id = obj.id || (obj._id ? obj._id.toString() : null);
      // Giả sử recipients chỉ chứa 1 classId (nếu nhiều thì lấy cái đầu)
      const classId = obj.recipients && obj.recipients.length > 0 ? obj.recipients[0] : null;
      let className = undefined;
      let teacherName = undefined;
      if (classId && classMap.has(classId)) {
        const cls = classMap.get(classId);
        className = cls.className;
        // Nếu teacher là object và có fullName thì lấy, nếu không thì để trống
        if (cls.teacher && typeof cls.teacher === 'object' && cls.teacher.fullName) {
          teacherName = cls.teacher.fullName;
        } else if (cls.teacher && typeof cls.teacher === 'object' && cls.teacher.username) {
          teacherName = cls.teacher.username;
        } else {
          teacherName = undefined;
        }
      }
      return {
        ...obj,
        id,
        className,
        teacherName,
      };
    });
    return result;
  }

  @Query(() => [NotificationWithClassInfo])
  @UseGuards(GqlAuthGuard)
  async getSentNotifications(@CurrentUser() user: any) {
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) return [];
    // Lấy tất cả noti do user này gửi
    const notis = await this.notificationService['notificationModel']
      .find({ sender: user.id })
      .sort({ createdAt: -1 });
    // Lấy tất cả class liên quan để map tên
    const classIds = Array.from(new Set(notis.flatMap((n:any)=>n.recipients)));
    const classes = await this.classModel.find({ _id: { $in: classIds } })
      .populate('teacher', 'id username fullName role')
      .exec();
    const classMap = new Map();
    for (const cls of classes) {
      classMap.set(cls.id.toString(), cls);
    }
    const result: NotificationWithClassInfo[] = notis.map((noti: any) => {
      const obj = noti.toObject ? noti.toObject() : noti;
      const id = obj.id || (obj._id ? obj._id.toString() : null);
      const classId = obj.recipients && obj.recipients.length > 0 ? obj.recipients[0] : null;
      let className = undefined;
      let teacherName = undefined;
      if (classId && classMap.has(classId)) {
        const cls = classMap.get(classId);
        className = cls.className;
        if (cls.teacher && typeof cls.teacher === 'object' && cls.teacher.fullName) {
          teacherName = cls.teacher.fullName;
        } else if (cls.teacher && typeof cls.teacher === 'object' && cls.teacher.username) {
          teacherName = cls.teacher.username;
        } else {
          teacherName = undefined;
        }
      }
      return {
        ...obj,
        id,
        className,
        teacherName,
      };
    });
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markNotificationAsRead(
    @Args('notificationId', { type: () => ID }) notificationId: string,
    @CurrentUser() user: any,
  ) {
    try {
      await this.notificationService.markAsRead(notificationId, user.id);
      return true;
    } catch (error) {
      throw new Error(`Lỗi khi đánh dấu thông báo: ${error.message}`);
    }
  }

  @Query(() => Int)
  @UseGuards(GqlAuthGuard)
  async getUnreadNotificationCount(@CurrentUser() user: any) {
    let userId: string;
    if (user && user._id) {
      userId = typeof user._id === 'string' ? user._id : user._id.toString();
    } else if (user && user.id) {
      userId = typeof user.id === 'string' ? user.id : user.id.toString();
    } else {
      return 0;
    }
    
    // Lấy classIds của user
    const classes = await this.classModel.find({ studentIds: userId });
    const classIds = classes.map((c: any) => c._id.toString());
    
    return this.notificationService.getUnreadCount(userId, classIds);
  }
}


