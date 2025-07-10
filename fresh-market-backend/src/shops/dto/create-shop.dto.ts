// src/shops/dto/create-shop.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsString()
  businessHours?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  deliveryRadius?: number;

  @IsOptional()
  @IsString()
  shopType?: string; // 'fruit_shop' is default in schema, but allow override if needed

  // isActive will be set by admin or defaults to false
}