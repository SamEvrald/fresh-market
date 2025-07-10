// src/orders/dto/update-order-status.dto.ts
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  status: OrderStatus;

  @IsOptional()
  @IsString()
  paymentStatus?: string; // e.g., 'paid', 'failed' - for admin/payment gateway updates
}