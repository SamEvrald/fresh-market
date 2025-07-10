// src/reviews/dto/update-review.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

// Remove productId, shopId, and isTargetValid from update DTO
// as these should not be changed after creation.
export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10))
  rating?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comment?: string;

  // Remove the properties that should not be updated from PartialType
  productId?: never;
  shopId?: never;
  isTargetValid?: never;
}