// src/payments/dto/mtn-webhook.dto.ts
import { IsString, IsUUID, IsOptional, IsNumberString, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class WebhookPayerDto {
  @IsString()
  partyIdType: string; // e.g., MSISDN
  @IsString()
  partyId: string; // e.g., "25078XXXXXXX"
}

export class MtnWebhookDto {
  @IsUUID()
  externalId: string; // This will be your orderId or a transaction reference

  @IsString()
  status: string; // 'SUCCESSFUL', 'FAILED', 'PENDING' etc.

  @IsString()
  financialTransactionId: string; // MTN's unique transaction ID

  @IsNumberString()
  amount: string; // Amount as a string, e.g., "100.0"

  @IsString()
  currency: string; // e.g., "RWF"

  @IsOptional()
  @IsString()
  reason?: string; // Reason for failure

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => WebhookPayerDto)
  payer?: WebhookPayerDto;

  @IsOptional()
  @IsString()
  correlationId?: string; // Corresponds to X-Reference-Id used in collection request
}