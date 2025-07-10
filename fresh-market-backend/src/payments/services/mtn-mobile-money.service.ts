// src/payments/services/mtn-mobile-money.service.ts
import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { InitiateMtnPaymentDto } from '../dto/initiate-mtn-payment.dto';
import { OrdersService } from '../../orders/services/orders.service';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Order } from '../../common/entities/order.entity'; // Import Order entity
import { AxiosResponse } from 'axios';
import { UserRole } from '../../common/entities/profile.entity';

@Injectable()
export class MtnMobileMoneyService {
  private readonly logger = new Logger(MtnMobileMoneyService.name);
  private collectionBaseUrl: string;
  private collectionClientId: string;
  private collectionClientSecret: string;
  private collectionApiKey: string; // This is the UUID for the API User in sandbox
  private callbackHost: string;
  private targetEnvironment: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: Date | null = null;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private ordersService: OrdersService, // To update order status
  ) {
    this.collectionBaseUrl = this.configService.get<string>('mtn.baseUrl') + '/collection/v1_0';
    this.collectionClientId = this.configService.get<string>('mtn.collectionClientId');
    this.collectionClientSecret = this.configService.get<string>('mtn.collectionClientSecret');
    this.collectionApiKey = this.configService.get<string>('mtn.collectionApiKey'); // API Key (X-Reference-Id)
    this.callbackHost = this.configService.get<string>('mtn.callbackHost');
    this.targetEnvironment = this.configService.get<string>('mtn.targetEnvironment');

    if (!this.collectionClientId || !this.collectionClientSecret || !this.collectionApiKey || !this.callbackHost) {
      this.logger.error('MTN Mobile Money configuration missing. Payments will not function.');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.accessTokenExpiry && new Date() < this.accessTokenExpiry) {
      return this.accessToken; // Use cached token if not expired
    }

    const tokenUrl = `${this.configService.get<string>('mtn.baseUrl')}/collection/token/`;
    const basicAuth = Buffer.from(`${this.collectionClientId}:${this.collectionClientSecret}`).toString('base64');

    try {
      this.logger.debug('Requesting new MTN access token...');
     const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          tokenUrl,
          {},
          {
            headers: {
              'Authorization': `Basic ${basicAuth}`,
              'Ocp-Apim-Subscription-Key': this.collectionApiKey, // Correct header for API Key
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.accessTokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000); // 1 minute buffer
      this.logger.log('Successfully obtained MTN access token.');
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get MTN access token:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to connect to MTN payment gateway.');
    }
  }

  /**
   * Initiates a mobile money collection request from a customer.
   * @param initiateDto Payment details.
   * @returns Transaction reference ID from your system.
   */
  async initiatePayment(initiateDto: InitiateMtnPaymentDto): Promise<{ transactionId: string; message: string }> {
    const { orderId, amount, currency, payerPhoneNumber } = initiateDto;
    const accessToken = await this.getAccessToken();
    const transactionId = uuidv4(); // Your unique reference for this transaction

    const callbackUrl = `${this.callbackHost}/api/v1/payments/mtn-mobile-money/webhook`;

    try {
      this.logger.log(`Initiating MTN payment for order ${orderId} with amount ${amount} to ${payerPhoneNumber}...`);
      await firstValueFrom(
        this.httpService.post(
          `${this.collectionBaseUrl}/requesttopay`,
          {
            amount: amount.toFixed(2), // Ensure two decimal places
            currency: currency,
            externalId: orderId, // Use your order ID as external ID for tracking
            payer: {
              partyIdType: 'MSISDN',
              partyId: payerPhoneNumber,
            },
            payerMessage: `Payment for Fresh Market Order ${orderId.substring(0, 8)}`,
            payeeNote: 'Fresh Market Order Payment',
          },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Reference-Id': transactionId, // Unique ID for this request
              'X-Target-Environment': this.targetEnvironment,
              'Ocp-Apim-Subscription-Key': this.collectionApiKey,
              'Content-Type': 'application/json',
              'X-Callback-Url': callbackUrl, // MTN will send status updates here
            },
          },
        ),
      );

      // Successfully initiated, status update will come via webhook
      return { transactionId, message: 'Payment request sent. Awaiting customer confirmation.' };
    } catch (error) {
      this.logger.error('MTN payment initiation failed:', error.response?.data || error.message);
      throw new BadRequestException(error.response?.data?.message || 'Failed to initiate MTN payment.');
    }
  }

  /**
   * Handles incoming MTN webhook notifications to update order status.
   * @param webhookData The payload from MTN.
   */
  async handleWebhook(webhookData: any): Promise<void> {
    this.logger.log(`Received MTN Webhook: ${JSON.stringify(webhookData)}`);

    const { externalId, status, financialTransactionId, amount, currency, reason, correlationId } = webhookData;

    if (!externalId || !status) {
      this.logger.error('Invalid MTN webhook payload: Missing externalId or status.');
      throw new BadRequestException('Invalid webhook payload.');
    }

    const orderId = externalId; // Assuming externalId is your orderId

    // 1. Fetch the order
    let order: Order;
    try {
      order = await this.ordersService.findOrderByIdForAdmin(orderId); // Use admin method as this is an internal process
    } catch (error) {
      this.logger.error(`Order ${orderId} not found for webhook. Maybe already processed or invalid ID.`);
      return; // Or throw NotFoundException if you want MTN to retry
    }

    // 2. Check for idempotency (prevent duplicate processing)
    if (order.paymentStatus === 'paid' && status === 'SUCCESSFUL') {
      this.logger.warn(`Webhook for order ${orderId} already processed as SUCCESSFUL. Skipping.`);
      return;
    }
    if (order.paymentStatus === 'failed' && status === 'FAILED') {
      this.logger.warn(`Webhook for order ${orderId} already processed as FAILED. Skipping.`);
      return;
    }

    // 3. Update order status based on webhook status
    let newPaymentStatus: string;
    let newOrderStatus: OrderStatus;
    const updateDto = { status: order.status, paymentStatus: order.paymentStatus }; // Default to current

    switch (status) {
      case 'SUCCESSFUL':
        newPaymentStatus = 'paid';
        newOrderStatus = OrderStatus.CONFIRMED; // Or 'PROCESSING'
        this.logger.log(`Payment SUCCESS for order ${orderId}. Financial ID: ${financialTransactionId}`);
        break;
      case 'FAILED':
        newPaymentStatus = 'failed';
        newOrderStatus = OrderStatus.CANCELLED; // Or 'PENDING' if you want customer to retry
        this.logger.warn(`Payment FAILED for order ${orderId}. Reason: ${reason}`);
        break;
      case 'PENDING':
        newPaymentStatus = 'pending';
        newOrderStatus = OrderStatus.PENDING;
        this.logger.log(`Payment PENDING for order ${orderId}.`);
        break;
      default:
        this.logger.warn(`Unhandled MTN webhook status for order ${orderId}: ${status}`);
        return; // Do not update for unknown statuses
    }

    updateDto.paymentStatus = newPaymentStatus;
    updateDto.status = newOrderStatus; // Update order status based on payment

    try {
      // Use the ordersService to update, ensure it has the logic to handle state transitions correctly
      // Note: Here, userRole will be ADMIN for internal system updates
      await this.ordersService.updateOrderStatus(
        this.configService.get<string>('auth.systemUserId') || uuidv4(), // Use a system user ID or a placeholder
        orderId,
        updateDto,
        UserRole.ADMIN,
      );
      this.logger.log(`Order ${orderId} updated to paymentStatus: ${newPaymentStatus}, orderStatus: ${newOrderStatus}`);
    } catch (updateError) {
      this.logger.error(`Failed to update order ${orderId} status from webhook:`, updateError.stack);
      throw new InternalServerErrorException('Failed to update order status.');
    }
  }

  // You might want a method to check transaction status later if webhooks fail or are delayed
  // async getTransactionStatus(transactionId: string): Promise<any> {
  //   const accessToken = await this.getAccessToken();
  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.get(
  //         `${this.collectionBaseUrl}/requesttopay/${transactionId}/status`,
  //         {
  //           headers: {
  //             'Authorization': `Bearer ${accessToken}`,
  //             'X-Target-Environment': this.targetEnvironment,
  //             'Ocp-Apim-Subscription-Key': this.collectionApiKey,
  //           },
  //         },
  //       ),
  //     );
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error('Failed to get MTN transaction status:', error.response?.data || error.message);
  //     throw new InternalServerErrorException('Failed to get transaction status from MTN.');
  //   }
  // }
}