// src/payments/payments.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // For HTTP requests
import { ConfigModule } from '@nestjs/config'; // For ConfigService
import { MtnMobileMoneyService } from './services/mtn-mobile-money.service';
import { CardPaymentService } from './services/card-payment.service';
import { PaymentsController } from './controllers/payments.controller';
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard, RolesGuard
import { OrdersModule } from '../orders/orders.module'; // To update order status

@Module({
  imports: [
    ConfigModule, // Make ConfigService available
    HttpModule, // For making HTTP requests to external APIs
    forwardRef(() => AuthModule), // For guards
    forwardRef(() => OrdersModule), // To inject OrdersService and update order status
  ],
  controllers: [PaymentsController],
  providers: [MtnMobileMoneyService, CardPaymentService],
  exports: [MtnMobileMoneyService, CardPaymentService], // Export if other modules need to interact with payments
})
export class PaymentsModule {}