// src/payments/dto/initiate-mtn-payment.dto.ts
import { IsUUID, IsNumber, IsString, IsNotEmpty, Min, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class InitiateMtnPaymentDto {
  @IsUUID()
  orderId: string; // The ID of the order being paid for

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount: number; // Amount to be paid

  @IsString()
  @IsNotEmpty()
  currency: string = 'RWF'; // Assuming Rwandan Francs, adjust as needed

  @IsPhoneNumber('RW') // Validate as Rwandan phone number
  payerPhoneNumber: string; // The customer's mobile money number
}