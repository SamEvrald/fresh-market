// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
// import { UsersService } from './services/users.service'; // REMOVE this line!
import { User } from '../common/entities/user.entity';
import { Profile } from '../common/entities/profile.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { NotificationsModule } from '../notifications/notifications.module'; // Ensure this is imported
import { UsersModule } from '../users/users.module'; // IMPORT UsersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') || '1h' },
      }),
      inject: [ConfigService],
    }),
    NotificationsModule, // Make sure NotificationsModule is imported to provide EmailService
    forwardRef(() => UsersModule), // Import UsersModule and use forwardRef
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    // UsersService, // REMOVE UsersService from providers, it's provided by UsersModule
    JwtStrategy,
  ],
  exports: [
    // AuthService, // Decide if you want to export AuthService, usually not needed by other modules directly
    JwtModule,
    PassportModule,
    // UsersService, // UsersService is exported by UsersModule now.
  ],
})
export class AuthModule {}