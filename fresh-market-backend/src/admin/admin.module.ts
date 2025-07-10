// src/admin/admin.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './services/admin.service';
import { AdminController } from './controllers/admin.controller';
import { User } from '../common/entities/user.entity';
import { Profile } from '../common/entities/profile.entity';
import { Shop } from '../common/entities/shop.entity';
import { Order } from '../common/entities/order.entity';

// Import modules whose services we will inject
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ShopsModule } from '../shops/shops.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Shop, Order]), // Register entities directly used or needed for reports
    forwardRef(() => AuthModule), // For JwtAuthGuard and RolesGuard
    forwardRef(() => UsersModule), // To use UsersService
    forwardRef(() => ShopsModule), // To use ShopsService
    forwardRef(() => OrdersModule), // To use OrdersService
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService], // Export if other modules need to interact with admin logic (e.g., internal system actions)
})
export class AdminModule {}