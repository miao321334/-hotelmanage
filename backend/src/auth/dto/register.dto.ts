import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: '用户邮箱',
    example: 'user@example.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: '用户密码',
    example: 'password123',
    required: true,
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({
    description: '用户名',
    example: '张三',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: '用户角色',
    example: 'merchant',
    enum: UserRole,
    required: true,
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role!: UserRole;
}
