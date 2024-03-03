import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/user.register.dto';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleInterceptor } from 'src/interceptors/role.interceptor';
import { CurrentUser } from 'src/decorators/currentUser.decorator';
import { RoleDto } from './dtos/role.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserUpdateDto } from './dtos/user.update.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('JWT_auth')
  @Post('register')
  async userRegister(@Body() body: CreateUserDto) {
    console.log('life is too hard');
    return await this.userService.userRegister(body);
  }

  @ApiBearerAuth('JWT_auth')
  @UseGuards(AuthGuard)
  @UseInterceptors(RoleInterceptor)
  @Get('all')
  async getAllUsers() {
    return await this.userService.findAllUsers();
  }

  @ApiBearerAuth('JWT_auth')
  @UseGuards(AuthGuard)
  @Post('task/create')
  async createUserTask(@CurrentUser() userId, @Body() body: any) {
    return await this.userService.createUserTask(userId, body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('tasks')
  async getAllUserTask(@CurrentUser() user: number) {
    return await this.userService.getAllTasks(user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(RoleInterceptor)
  @Patch('change/role/:id')
  async changeRole(@Param('id') id: string, @Body() body: RoleDto) {
    return await this.userService.changeRole(parseInt(id), body);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('update')
  async updateUser(@Body() body: UserUpdateDto, @CurrentUser() userId: number) {
    return await this.userService.updateUser(body, userId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @UseInterceptors(RoleInterceptor)
  @Delete('delete/:id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.deleteUser(parseInt(id));
  }
}
