// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './services/email.service';

@Module({
  imports: [ConfigModule], // EmailService uses ConfigService
  providers: [EmailService],
  exports: [EmailService], // Export EmailService so other modules can use it
})
export class NotificationsModule {}