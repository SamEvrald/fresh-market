// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { Product } from '../common/entities/product.entity';
import { Shop } from '../common/entities/shop.entity'; // Need Shop entity for relations and ownership checks
import { AuthModule } from '../auth/auth.module'; // To use JwtAuthGuard and RolesGuard
import { forwardRef } from '@nestjs/common';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Shop]), // Register Product and Shop entities
    forwardRef(() => AuthModule), // For JwtAuthGuard and RolesGuard
    forwardRef(() => ShopsModule), // Import ShopsModule to use ShopsService
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, TypeOrmModule.forFeature([Product])], // Export ProductsService for other modules (e.g., OrdersModule)
})
export class ProductsModule {}