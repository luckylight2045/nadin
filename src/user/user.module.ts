import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { RoleInterceptor } from 'src/interceptors/role.interceptor';
import { Task } from 'src/tasks/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task]), JwtModule],
  controllers: [UserController],
  providers: [UserService, RoleInterceptor],
  exports: [UserService],
})
export class UserModule {}
