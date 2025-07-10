// src/products/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsInt, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer'; // For @Type decorator

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number) // Ensure price is transformed to a number
  price: number;

  @IsOptional()
  @IsString()
  unit?: string; // e.g., 'kg', 'piece', 'bundle'

  @IsOptional()
  @IsString()
  category?: string; // e.g., 'Fruits', 'Vegetables', 'Exotic Fruits'

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number) // Ensure stockQuantity is transformed to an integer
  stockQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  // Note: image_url is handled by the file upload interceptor, not directly in DTO body
}