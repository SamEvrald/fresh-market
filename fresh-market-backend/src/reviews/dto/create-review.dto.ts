// src/reviews/dto/create-review.dto.ts
import { IsUUID, IsInt, Min, Max, IsString, IsOptional, IsNotEmpty, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReviewDto {
  @IsOptional()
  @IsUUID()
  productId?: string; // Product ID, if reviewing a product

  @IsOptional()
  @IsUUID()
  shopId?: string; // Shop ID, if reviewing a shop

  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10)) // Ensure rating is an integer
  rating: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;

  // Custom validation to ensure exactly one of productId or shopId is provided
  @IsBoolean({ message: 'A review must target either a product or a shop, not both.' })
  @Transform(({ obj }) => {
    const hasProductId = typeof obj.productId === 'string' && obj.productId.length > 0;
    const hasShopId = typeof obj.shopId === 'string' && obj.shopId.length > 0;
    return (hasProductId && !hasShopId) || (!hasProductId && hasShopId);
  })
  readonly isTargetValid: boolean;
}