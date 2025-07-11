// src/orders/dto/create-order.dto.ts
import { ArrayNotEmpty, IsString, IsNotEmpty, ValidateNested, IsUUID, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer'; // For @Type decorator

class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  shopId: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // e.g., 'Cash on Delivery', 'MOMO', 'Card'
}