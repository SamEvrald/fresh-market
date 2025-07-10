// src/products/dto/search-products.dto.ts
import { IsOptional, IsString, IsNumberString, IsUUID, IsBooleanString } from 'class-validator';

export class SearchProductsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsUUID()
  shopId?: string; // To search products within a specific shop

  @IsOptional()
  @IsNumberString() // For query parameters which are strings
  minPrice?: string;

  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @IsOptional()
  @IsBooleanString() // 'true' or 'false' from query string
  isAvailable?: string;
}