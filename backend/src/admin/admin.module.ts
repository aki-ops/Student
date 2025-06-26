import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { UsersModule } from 'src/users/users.module';

@Module({
  providers: [AdminResolver, AdminService],
  imports: [UsersModule],
})
export class AdminModule {}
