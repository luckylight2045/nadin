import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async loginService(userName: string, password: string) {
    const user = await this.userService.findUserByUserName(userName);

    if (!user) {
      throw new NotFoundException('this userName does not exist', {
        cause: new Error(),
        description: 'enter another userName',
      });
    }

    const [salt, hashPass] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== hashPass) {
      throw new BadRequestException('password is not correct');
    }

    const payload = { sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
