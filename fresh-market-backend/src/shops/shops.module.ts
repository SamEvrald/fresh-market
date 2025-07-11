// src/shops/shops.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopsService } from './services/shops.service';
import { ShopsController } from './controllers/shops.controller';
import { Shop } from '../common/entities/shop.entity';
import { Profile } from '../common/entities/profile.entity'; // Also needed for relationships/validation
import { AuthModule } from '../auth/auth.module'; // To use JwtAuthGuard and RolesGuard
import { UsersModule } from '../users/users.module'; // To use UsersService (e.g., for checking vendor roles)
import { ProductsModule } from '../products/products.module'; 
import { Order } from 'src/common/entities/order.entity';
import { Or } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Profile, Order]), // Register Shop and Profile entities for this module
    forwardRef(() => AuthModule), // Use forwardRef to resolve circular dependency if AuthModule also imports this
    UsersModule, // Import UsersModule to inject UsersService
    ProductsModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
  exports: [ShopsService, TypeOrmModule.forFeature([Shop, Order])], // Export ShopsService so other modules (like ProductsModule, OrdersModule) can use it. Also export TypeOrmModule.forFeature([Shop]) so others can directly inject Shop repository.
})
export class ShopsModule {}