// src/orders/orders.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';
import { Product } from '../common/entities/product.entity'; // Needed for order item validation/stock update
import { Profile } from '../common/entities/profile.entity'; // Needed for customer/owner relation
import { Shop } from '../common/entities/shop.entity';     // Needed for shop relation/validation
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard, RolesGuard
import { ShopsModule } from '../shops/shops.module'; // To use ShopsService for shop lookup
import { ProductsModule } from '../products/products.module'; // To use ProductsService for product lookup/stock update
import { NotificationsModule } from '../notifications/notifications.module'; // For EmailService
import { SocketGateway } from '../socket/socket.gateway';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Profile, Shop]), // Register all entities used
    forwardRef(() => AuthModule), // For guards
    ShopsModule, // For ShopsService (to verify shop ownership/existence)
    ProductsModule, // For ProductsService (to get products, update stock)
    NotificationsModule, // For EmailService (order confirmations, status updates)
    SocketModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule.forFeature([Order, OrderItem])], // Export services if other modules need them
})
export class OrdersModule {}