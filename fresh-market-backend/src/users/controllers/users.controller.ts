// src/users/controllers/users.controller.ts
import { Controller, Get, Patch, Body, UseGuards, Request, HttpCode, NotFoundException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Import JwtAuthGuard
import { UpdateProfileDto } from '../dto/update-profile.dto';

@UseGuards(JwtAuthGuard) // Protect all routes in this controller
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMyProfile(@Request() req) {
    // req.user is populated by JwtAuthGuard with { id, email, profile }
    const user = await this.usersService.findUserById(req.user.id);
    if (!user) {
      // This should ideally not happen if JWT validation is successful
      throw new NotFoundException('Authenticated user profile not found.');
    }
    // Return only necessary user and profile info, avoid sending hashed password
    return {
      id: user.id,
      email: user.email,
      profile: {
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        role: user.profile.role,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateMyProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    // req.user.id contains the authenticated user's ID
    const updatedProfile = await this.usersService.updateProfile(
      req.user.id,
      updateProfileDto.fullName,
      updateProfileDto.phone,
    );

    // Re-fetch the user to get the full updated picture including the user.email
    const user = await this.usersService.findUserById(req.user.id);

    return {
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        profile: {
          fullName: updatedProfile.fullName,
          phone: updatedProfile.phone,
          role: updatedProfile.role,
          createdAt: updatedProfile.createdAt,
          updatedAt: updatedProfile.updatedAt,
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}