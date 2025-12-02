import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LoginRateLimiterService } from './login-rate-limiter.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly rateLimiter: LoginRateLimiterService,
  ) {}

  async login(
    loginDto: LoginDto,
    clientIp: string,
  ): Promise<{ accessToken: string; username: string }> {
    const { username, password } = loginDto;

    // Use combination of IP and username for rate limiting
    const rateLimitKey = `${clientIp}:${username}`;

    // Check if this client is currently locked out
    const checkResult = this.rateLimiter.checkAttempt(rateLimitKey);
    if (!checkResult.allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: checkResult.message,
          retryAfter: checkResult.retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Find admin user
    const admin = await this.prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      // Record failed attempt and get lockout info
      const lockoutInfo = this.rateLimiter.recordFailedAttempt(rateLimitKey);
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `Ungültige Anmeldedaten. ${lockoutInfo.message}`,
          retryAfter: lockoutInfo.retryAfter,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      // Record failed attempt and get lockout info
      const lockoutInfo = this.rateLimiter.recordFailedAttempt(rateLimitKey);
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: `Ungültige Anmeldedaten. ${lockoutInfo.message}`,
          retryAfter: lockoutInfo.retryAfter,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Successful login - clear failed attempts
    this.rateLimiter.clearAttempts(rateLimitKey);

    // Create JWT token
    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      username: admin.username,
    };
  }

  async validateAdmin(userId: string) {
    const admin = await this.prisma.adminUser.findUnique({
      where: { id: userId },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin nicht gefunden');
    }

    return admin;
  }
}
