// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { UserRole } from 'common/enums/user-role.enum';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { UpdateUserInput } from './dto/update-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) { }

  // 🔍 Tìm user để đăng nhập
  async findByUsername(username: string): Promise<User | null> {
    return this.userModel.findOne({ username }).exec();
  }

  // ➕ Tạo user khi tạo student/teacher
  async createUser(data: {
    fullName?: string;
    username: string;
    password: string; // đã hash
    role: UserRole;
  }): Promise<User> {
    console.log('DEBUG: Creating user with data:', data);
    const createdUser = new this.userModel(data);
    return createdUser.save();
  }


  // 🔍 Tìm theo ID (nếu cần validate user từ token)
  async findById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec();
  }

  // 🔐 Đổi mật khẩu (tuỳ chọn)
  async changePassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.save();

  }

  async findAll(user: User): Promise<User[]> {
    console.log('DEBUG: findAll called with user role:', user.role);
    
    if (user.role === UserRole.ADMIN) {
      const users = await this.userModel.find().exec();
      console.log('DEBUG: Found users:', users.map(u => ({ id: u.id, username: u.username, fullName: u.fullName, role: u.role })));
      return users;
    }
    if (user.role === UserRole.STUDENT) {
      const currentuser = await this.userModel.findById(user.id);
      return currentuser ? [currentuser] : [];
    }
    return [];
  }

  async findbyRole(role: UserRole): Promise<User[]> {
    return this.userModel.find({ role }).exec();
  }

  // ✏️ Cập nhật user
  async update(id: number, updateUserInput: UpdateUserInput): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserInput },
      { new: true }
    ).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  // 🗑️ Xóa user
  async remove(id: number): Promise<User> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }
}
