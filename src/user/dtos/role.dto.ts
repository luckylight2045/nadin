import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty()
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
