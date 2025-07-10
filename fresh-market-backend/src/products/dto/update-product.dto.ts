// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types'; // Make sure @nestjs/mapped-types is installed
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsBoolean } from 'class-validator';

// Inherit all properties from CreateProductDto and make them optional
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean; // Vendor might change availability without changing stock
}