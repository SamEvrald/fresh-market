// src/auth/services/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto'; // For generating reset tokens
import { UsersService } from '../../users/services/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../notifications/services/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService, // Use public methods of this service
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; user: any }> {
    const { email, password, fullName, role } = registerDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.createUser(email, hashedPassword, fullName, role);

    try {
      await this.emailService.sendWelcomeEmail(user.email, user.profile.fullName || user.email);
    } catch (emailError) {
      this.logger.error(`Failed to send welcome email to ${user.email}:`, emailError.stack);
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: {
          fullName: user.profile.fullName,
          role: user.profile.role,
        },
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
    const { email, password } = loginDto;
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        profile: {
          fullName: user.profile.fullName,
          role: user.profile.role,
        },
      },
    };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      this.logger.warn(`Password reset request for non-existent email: ${email}`);
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await this.usersService.updateUserResetToken(user.id, resetToken, resetExpires);

    const frontendResetUrl = `http://localhost:8081/reset-password?token=${resetToken}`; // Adjust this to your actual frontend URL

    try {
      await this.emailService.sendPasswordResetEmail(user.email, user.profile.fullName || user.email, frontendResetUrl);
      this.logger.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      this.logger.error(`Failed to send password reset email to ${user.email}:`, emailError.stack);
      throw new BadRequestException('Failed to send password reset email. Please try again later.');
    }
  }

  async resetPassword(token: string, newPasswordPlain: string): Promise<void> {
    // Corrected: Use the new public method to find user by reset token
    const userWithToken = await this.usersService.findOneByResetToken(token);

    if (!userWithToken || userWithToken.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token.');
    }

    const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
    userWithToken.password = hashedPassword;
    userWithToken.resetPasswordToken = null; // Clear token
    userWithToken.resetPasswordExpires = null; // Clear expiration

    // Corrected: Use the new public method to save the user
    await this.usersService.saveUser(userWithToken);

    try {
      await this.emailService.sendPasswordChangeConfirmationEmail(userWithToken.email, userWithToken.profile.fullName || userWithToken.email);
    } catch (emailError) {
      this.logger.warn(`Failed to send password change confirmation email to ${userWithToken.email}:`, emailError.stack);
    }
  }
}