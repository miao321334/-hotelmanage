import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(registerDto: RegisterDto) {
    if (!registerDto || !registerDto.email) {
      throw new UnauthorizedException('Invalid request body');
    }

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    // 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role,
      },
    });

    // 生成JWT令牌
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    if (!loginDto || !loginDto.email) {
      throw new UnauthorizedException('Invalid request body');
    }

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 生成JWT令牌
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(userId: string, role: string) {
    // 生成JWT令牌
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET || 'your-secret-key' as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      } as jwt.SignOptions,
    );
  }
}
