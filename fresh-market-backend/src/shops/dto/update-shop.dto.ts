// src/shops/dto/update-shop.dto.ts
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types'; // For PartialType
import { CreateShopDto } from './create-shop.dto'; 

// Install mapped-types: npm install @nestjs/mapped-types

// Inherit all properties from CreateShopDto and make them optional
export class UpdateShopDto extends PartialType(CreateShopDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // Admin can update this. Vendors might not be able to directly.
}