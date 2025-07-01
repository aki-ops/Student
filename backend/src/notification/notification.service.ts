import { Injectable } from '@nestjs/common';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './entities/notification.entity';


// src/notification/notification.service.ts
@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) { }

  async create(input: CreateNotificationInput, senderId: string) {
    if ((!input.recipients || input.recipients.length === 0)) {
      throw new Error('Phải chọn ít nhất một học sinh hoặc một lớp để gửi thông báo.');
    }
    const notification = new this.notificationModel({
      ...input,
      sender: senderId,
      recipients: input.recipients,
    });
    await notification.save();
    return this.notificationModel.findById(notification._id)
      .populate('sender');
  }

  // notification.service.ts
  async findForUser(userId: string, classIds: string[]) {
    return this.notificationModel
      .find({
        $or: [
          { recipients: userId },
          { targetClasses: { $in: classIds } },
        ],
      })
      .sort({ createdAt: -1 })
      .populate('sender');
  }

  async findById(id: string) {
    return this.notificationModel.findById(id).populate('sender');
  }

  async remove(id: string) {
    return this.notificationModel.findByIdAndDelete(id);
  }

}
