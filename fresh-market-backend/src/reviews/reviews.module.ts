// src/reviews/reviews.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from './controllers/reviews.controller';
import { Review } from '../common/entities/review.entity';
import { Product } from '../common/entities/product.entity';
import { Shop } from '../common/entities/shop.entity';
import { Profile } from '../common/entities/profile.entity';
import { Order } from '../common/entities/order.entity'; // For purchase verification
import { OrderItem } from '../common/entities/order-item.entity'; // For purchase verification
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard, RolesGuard
import { ProductsModule } from '../products/products.module'; // To retrieve product details (if needed beyond direct repo access)
import { ShopsModule } from '../shops/shops.module'; // To retrieve shop details

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Product, Shop, Profile, Order, OrderItem]), // Register all entities
    forwardRef(() => AuthModule), // For guards
    ProductsModule, // Might be needed for some queries or just to confirm product existence
    ShopsModule, // Might be needed for some queries or just to confirm shop existence
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService, TypeOrmModule.forFeature([Review])], // Export for potential future use (e.g., admin dashboard)
})
export class ReviewsModule {}