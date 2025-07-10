// src/reviews/services/reviews.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../common/entities/review.entity';
import { Product } from '../../common/entities/product.entity';
import { Shop } from '../../common/entities/shop.entity';
import { Profile, UserRole } from '../../common/entities/profile.entity';
import { Order } from '../../common/entities/order.entity'; // For purchase verification
import { OrderItem } from '../../common/entities/order-item.entity'; // For purchase verification
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';


@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  /**
   * Creates a new review for a product or shop.
   * @param createReviewDto Review data.
   * @param customerId The ID of the authenticated customer.
   * @returns The created review.
   */
  async createReview(createReviewDto: CreateReviewDto, customerId: string): Promise<Review> {
    const { productId, shopId, rating, comment } = createReviewDto;

    // Check if customer has already reviewed this product/shop
    const existingReview = await this.reviewsRepository.findOne({
      where: { customerId, productId: productId || null, shopId: shopId || null },
    });
    if (existingReview) {
      throw new ConflictException('You have already reviewed this item/shop.');
    }

    // Verify purchase for legitimacy
    let targetEntity: Product | Shop | null = null;
    let hasPurchased = false;

    if (productId) {
      targetEntity = await this.productsRepository.findOne({ where: { id: productId } });
      if (!targetEntity) {
        throw new NotFoundException('Product not found.');
      }
      // Check if customer ordered this product
      const orderCount = await this.ordersRepository.createQueryBuilder('order')
        .innerJoin('order.orderItems', 'orderItem')
        .where('order.customerId = :customerId', { customerId })
        .andWhere('orderItem.productId = :productId', { productId })
        .andWhere('order.status = :status', { status: OrderStatus.DELIVERED }) // Only allow reviews for delivered orders
        .getCount();
      hasPurchased = orderCount > 0;
    } else if (shopId) {
      targetEntity = await this.shopsRepository.findOne({ where: { id: shopId } });
      if (!targetEntity) {
        throw new NotFoundException('Shop not found.');
      }
      // Check if customer ordered from this shop
      const orderCount = await this.ordersRepository.count({
        where: { customerId, shopId: shopId, status: OrderStatus.DELIVERED }, // Only allow reviews for delivered orders
      });
      hasPurchased = orderCount > 0;
    } else {
      throw new BadRequestException('A review must target either a product or a shop.');
    }

    if (!hasPurchased) {
      throw new ForbiddenException('You can only review items/shops you have purchased from and received.');
    }

    const review = this.reviewsRepository.create({
      customerId,
      productId: productId || null,
      shopId: shopId || null,
      rating,
      comment,
    });

    return this.reviewsRepository.save(review);
  }

  /**
   * Finds all reviews for a specific product.
   * @param productId The ID of the product.
   * @returns List of reviews for the product.
   */
  async findReviewsByProductId(productId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { productId },
      relations: ['customer'], // Load customer profile for review display
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Finds all reviews for a specific shop.
   * @param shopId The ID of the shop.
   * @returns List of reviews for the shop.
   */
  async findReviewsByShopId(shopId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { shopId },
      relations: ['customer'], // Load customer profile for review display
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Finds all reviews by a specific customer.
   * @param customerId The ID of the customer.
   * @returns List of reviews by the customer.
   */
  async findReviewsByCustomerId(customerId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { customerId },
      relations: ['product', 'shop'], // Load product/shop for context
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Updates a review by its author.
   * @param reviewId The ID of the review.
   * @param customerId The ID of the authenticated customer (author).
   * @param updateReviewDto Update data.
   * @returns The updated review.
   */
  async updateReview(reviewId: string, customerId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }
    if (review.customerId !== customerId) {
      throw new ForbiddenException('You are not authorized to update this review.');
    }

    Object.assign(review, updateReviewDto);
    return this.reviewsRepository.save(review);
  }

  /**
   * Deletes a review by its author or an admin.
   * @param reviewId The ID of the review.
   * @param userId The ID of the user attempting deletion.
   * @param userRole The role of the user attempting deletion.
   */
  async deleteReview(reviewId: string, userId: string, userRole: UserRole): Promise<void> {
    const review = await this.reviewsRepository.findOne({ where: { id: reviewId } });

    if (!review) {
      throw new NotFoundException('Review not found.');
    }

    // Check if the user is the author or an admin
    if (review.customerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('You are not authorized to delete this review.');
    }

    await this.reviewsRepository.remove(review);
  }
}