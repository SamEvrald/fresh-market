// src/admin/dto/update-shop-status.dto.ts
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateShopStatusDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // For activating/deactivating shops

  @IsOptional()
  @IsString()
  reason?: string; // Optional reason for status change
}