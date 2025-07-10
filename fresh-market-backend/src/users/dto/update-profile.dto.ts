// src/users/dto/update-profile.dto.ts
import { IsString, IsOptional, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
@IsPhoneNumber('RW', { message: 'Phone number must be a valid Rwandan phone number' }) // Requires 'libphonenumber-js'
  phone?: string;
}