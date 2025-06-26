import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserRole } from 'common/enums/user-role.enum';
import { CurrentUser } from 'common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';


@Injectable()
export class AdminService {

    constructor(
        private readonly UsersService: UsersService,
    ) {}

    async findAllUser(user: User) {
        return this.UsersService.findAll(user);
    }

    async findStudent() {
        return this.UsersService.findbyRole(UserRole.STUDENT);
    }

    async findTeacher() {
        return this.UsersService.findbyRole(UserRole.TEACHER);
    }
}
