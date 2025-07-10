// src/reviews/controllers/reviews.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, UseGuards, Request, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';

@Controller() // Use root controller for varied paths
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  // --- Customer/Author Endpoints ---

  @Post('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  async createReview(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    // req.user.id is the customer's profile ID
    const review = await this.reviewsService.createReview(createReviewDto, req.user.id);
    return { message: 'Review submitted successfully!', review };
  }

  @Get('customers/me/reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async getMyReviews(@Request() req) {
    return this.reviewsService.findReviewsByCustomerId(req.user.id);
  }

  @Patch('reviews/:reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async updateMyReview(@Request() req, @Param('reviewId') reviewId: string, @Body() updateReviewDto: UpdateReviewDto) {
    const updatedReview = await this.reviewsService.updateReview(reviewId, req.user.id, updateReviewDto);
    return { message: 'Review updated successfully!', review: updatedReview };
  }

  @Delete('reviews/:reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN) // Allow customer to delete their own, admin to delete any
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReview(@Request() req, @Param('reviewId') reviewId: string) {
    await this.reviewsService.deleteReview(reviewId, req.user.id, req.user.profile.role);
  }

  // --- Public/Read-only Endpoints ---

  @Get('shops/:shopId/reviews')
  @HttpCode(HttpStatus.OK)
  async getReviewsForShop(@Param('shopId') shopId: string) {
    return this.reviewsService.findReviewsByShopId(shopId);
  }

  @Get('products/:productId/reviews')
  @HttpCode(HttpStatus.OK)
  async getReviewsForProduct(@Param('productId') productId: string) {
    return this.reviewsService.findReviewsByProductId(productId);
  }
}