// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

// Import all modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module'; // Import AdminModule

// Import all entities
import { User } from './common/entities/user.entity';
import { Profile } from './common/entities/profile.entity';
import { Shop } from './common/entities/shop.entity';
import { Product } from './common/entities/product.entity';
import { Order } from './common/entities/order.entity';
import { OrderItem } from './common/entities/order-item.entity';
import { Review } from './common/entities/review.entity';
(global as any).crypto = require('crypto');
import { SocketGateway } from './socket/socket.gateway';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [User, Profile, Shop, Product, Order, OrderItem, Review], // All your entities must be listed here
        synchronize: false, // For development, set to false and use migrations in production!
        logging: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    NotificationsModule,
    ShopsModule,
    ProductsModule,
    OrdersModule,
    ReviewsModule,
    PaymentsModule,
    AdminModule, // Add AdminModule here
  ],
  controllers: [AppController],
  providers: [AppService, SocketGateway],
})
export class AppModule {}