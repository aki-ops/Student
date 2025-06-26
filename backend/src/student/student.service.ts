import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRole } from 'common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StudentService {

  constructor(private readonly UsersService: UsersService) { }


  async find(user: User) {
    return this.UsersService.findAll(user);
  }

}
