// src/payments/controllers/payments.controller.ts
import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { MtnMobileMoneyService } from '../services/mtn-mobile-money.service';
import { CardPaymentService } from '../services/card-payment.service'; // Assuming you have a card service
import { InitiateMtnPaymentDto } from '../dto/initiate-mtn-payment.dto';
import { MtnWebhookDto } from '../dto/mtn-webhook.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private mtnMobileMoneyService: MtnMobileMoneyService,
    private cardPaymentService: CardPaymentService, // Inject card service
  ) {}

  // --- MTN Mobile Money Endpoints ---

  @Post('mtn-mobile-money/initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER) // Only customers can initiate payments
  @HttpCode(HttpStatus.OK)
  async initiateMtnPayment(@Request() req, @Body() initiateDto: InitiateMtnPaymentDto) {
    // Optionally, you might want to pre-check if the order belongs to this customer
    // The service handles linking to the order.
    return this.mtnMobileMoneyService.initiatePayment(initiateDto);
  }

  @Post('mtn-mobile-money/webhook')
  @HttpCode(HttpStatus.OK) // MTN expects a 200 OK to acknowledge receipt
  // IMPORTANT: For production, add security here:
  // - IP Whitelisting (at firewall/proxy level)
  // - Signature Verification (if MTN provides a header for it, verify `X-Signature` or similar)
  async handleMtnWebhook(@Body() webhookData: MtnWebhookDto, @Headers() headers: any) {
    // Example: Basic webhook authentication (replace with actual MTN method if available)
    // if (!headers['x-mtn-signature'] || !this.verifyMtnSignature(headers['x-mtn-signature'], webhookData)) {
    //   throw new UnauthorizedException('Invalid webhook signature');
    // }

    await this.mtnMobileMoneyService.handleWebhook(webhookData);
    return { received: true }; // Acknowledge receipt
  }

  // --- Card Payment Endpoints (Placeholder) ---

  @Post('card/initiate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async initiateCardPayment(@Request() req, @Body() body: { orderId: string; amount: number; currency: string; cardDetails: any }) {
    // Implement DTOs for card payments
    return this.cardPaymentService.initiateCardPayment(body.orderId, body.amount, body.currency, body.cardDetails);
  }

  @Post('card/webhook')
  @HttpCode(HttpStatus.OK)
  async handleCardWebhook(@Body() payload: any) {
    await this.cardPaymentService.handleCardWebhook(payload);
    return { received: true };
  }

  // Private helper for MTN signature verification (implement based on actual MTN docs)
  // private verifyMtnSignature(signature: string, payload: any): boolean {
  //   // This is highly specific to the payment gateway.
  //   // Typically involves hashing the payload with a shared secret key and comparing.
  //   // E.g., `crypto.createHmac('sha256', this.configService.get('mtn.webhookSecret')).update(JSON.stringify(payload)).digest('hex')`
  //   this.logger.warn('MTN Webhook signature verification is a placeholder.');
  //   return true; // DANGER: Replace with actual verification in production
  // }
}