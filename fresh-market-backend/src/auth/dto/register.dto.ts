// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsEnum } from 'class-validator';
import { UserRole } from '../../common/entities/profile.entity'; // Import UserRole enum

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName: string;

  @IsString()
  @IsEnum(UserRole, { message: 'Invalid role. Must be customer, vendor, or admin.' })
  role: UserRole;
}