import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dtos/user.register.dto';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Task } from 'src/tasks/task.entity';
import { RoleDto } from './dtos/role.dto';
import { UserUpdateDto } from './dtos/user.update.dto';

const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @InjectRepository(Task) private readonly task: Repository<Task>,
    private readonly dataSource: DataSource,
  ) {}

  async userRegister(body: CreateUserDto) {
    const { email, password, userName, phoneNumber } = body;

    if (await this.findUserByEmail(email)) {
      throw new BadRequestException('this email already in use.', {
        cause: new Error(),
        description: 'you should use another email',
      });
    }

    if (await this.findUserByPhoneNumber(phoneNumber)) {
      throw new BadRequestException('this phoneNumber already in use.', {
        cause: new Error(),
        description: 'you should use another phoneNumber',
      });
    }

    if (await this.findUserByUserName(userName)) {
      throw new BadRequestException('this userName already in use.', {
        cause: new Error(),
        description: 'you should use another userName',
      });
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashPass = salt + '.' + hash.toString('hex');

    this.userRegister2({ ...body, password: hashPass });
  }

  async userRegister2(body: CreateUserDto) {
    const { email, password, userName, phoneNumber } = body;
    console.log(body.role);
    const user = this.repo.create({
      email,
      password,
      userName,
      phoneNumber,
      role: body.role ? body.role : UserRole.USER,
    });

    return this.repo.save(user);
  }

  async createUserTask(userId: number, taskObj: Task) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.repo.findOne({
        where: {
          id: userId,
        },
        relations: {
          tasks: true,
        },
      });

      if (!user) {
        throw new BadRequestException();
      }

      user.tasks = [...user.tasks, taskObj];
      await this.repo.save(user);

      const task1 = this.task.create({
        title: taskObj.title,
        description: taskObj.description,
        attachment: taskObj.attachment,
        user,
      });

      await this.task.save(task1);
      console.log(task1);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getAllTasks(userId: number) {
    const user = await this.findUserById(userId);
    const tasks = await this.task.find({
      where: [user],
    });

    console.log(tasks);
    return tasks;
  }

  async changeRole(id: number, body: RoleDto) {
    const user = await this.repo.findOne({
      where: {
        id,
      },
    });

    user.role = body.role;

    await this.repo.save(user);
  }

  async updateUser(body: UserUpdateDto, userId: number) {
    const user = await this.findUserById(userId);

    if (!user) {
      throw new BadRequestException();
    }

    if (body.password) {
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(body.password, salt, 32)) as Buffer;
      const hashPass = salt + '.' + hash.toString('hex');
      user.password = hashPass;
    }

    user.email = body.email ? body.email : user.email;
    user.phoneNumber = body.phoneNumber ? body.phoneNumber : user.phoneNumber;

    await this.repo.save(user);
  }

  async deleteUser(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.repo.findOne({
        where: {
          id,
        },
        relations: {
          tasks: true,
        },
      });

      if (!user) {
        throw new BadRequestException();
      }

      await this.repo.remove(user);

      const task1 = await this.task.find({
        where: {
          user,
        },
      });

      console.log(task1);

      await this.task.remove(task1);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async findUserByEmail(email: string) {
    return await this.repo.findOne({
      where: {
        email,
      },
    });
  }

  async findUserByPhoneNumber(phoneNumber: string) {
    return await this.repo.findOne({
      where: {
        phoneNumber,
      },
    });
  }

  async findUserByUserName(userName: string) {
    return await this.repo.findOne({
      where: {
        userName,
      },
    });
  }

  async findUserById(id: number) {
    return await this.repo.findOne({
      where: {
        id,
      },
    });
  }

  async findAllUsers() {
    return this.repo.find({});
  }
}
