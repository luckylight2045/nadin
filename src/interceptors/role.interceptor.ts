import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoleInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { userId } = request;
    const user = await this.userService.findUserById(userId);

    if (user.role == UserRole.ADMIN) {
      return next.handle();
    }

    throw new UnauthorizedException('you do not have access to this section');
  }
}
