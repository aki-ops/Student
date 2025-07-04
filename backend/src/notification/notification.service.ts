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
    return this.notificationModel.findById(notification._id);
  }

  // notification.service.ts
  async findForUser(classIds: string[]) {
    const notis = await this.notificationModel
      .find({
        recipients: { $in: classIds }
      })
      .sort({ createdAt: -1 });
    return notis;
  }

  async findById(id: string) {
    return this.notificationModel.findById(id);
  }

  async remove(id: string) {
    return this.notificationModel.findByIdAndDelete(id);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new Error('Không tìm thấy thông báo');
    }
    
    // Thêm userId vào danh sách readBy nếu chưa có
    if (!notification.readBy.includes(userId)) {
      notification.readBy.push(userId);
      await notification.save();
    }
    
    return notification;
  }

  async getUnreadCount(userId: string, classIds: string[]) {
    const notifications = await this.notificationModel.find({
      recipients: { $in: classIds },
      readBy: { $ne: userId }
    });
    return notifications.length;
  }

}
