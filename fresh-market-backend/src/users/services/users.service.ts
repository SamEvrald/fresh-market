// src/users/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../common/entities/user.entity';
import { Profile } from '../../common/entities/profile.entity';
import { UserRole } from '../../common/entities/profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // This is correctly private
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email }, relations: ['profile'] });
  }

 async createUser(email: string, hashedPassword: string, fullName: string, role: UserRole): Promise<User> {
  const user = this.usersRepository.create({ email, password: hashedPassword }); // ✅ Removed role here
  await this.usersRepository.save(user);

  const profile = this.profilesRepository.create({
    id: user.id,
    fullName,
    role,
  });
  await this.profilesRepository.save(profile);

  user.profile = profile;
  return user;
}

  async findUserById(id: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { id }, relations: ['profile'] });
  }

  // New public method to find user by reset token
  async findOneByResetToken(token: string): Promise<User | undefined> {
    return this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
  }

  async updateUserResetToken(userId: string, token: string | null, expires: Date | null): Promise<void> {
    await this.usersRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  // New public method to save/update a user entity
  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  // Existing method for UsersModule's update profile
  async updateProfile(userId: string, fullName?: string, phone?: string): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({ where: { id: userId } });

    if (!profile) {
      throw new NotFoundException('User profile not found.');
    }

    if (fullName !== undefined) {
      profile.fullName = fullName;
    }
    if (phone !== undefined) {
      profile.phone = phone;
    }

    return this.profilesRepository.save(profile);
  }
}