// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from '../common/entities/user.entity';
import { Profile } from '../common/entities/profile.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule to use JwtAuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]), // Register User and Profile entities
    // Import AuthModule because UsersController uses JwtAuthGuard from AuthModule
    forwardRef(() => AuthModule), // Use forwardRef to resolve circular dependency if AuthModule also imports UsersModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService so other modules can inject it
})
export class UsersModule {}