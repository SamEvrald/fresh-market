// src/shops/services/shops.service.ts
import { Injectable, ConflictException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../common/entities/shop.entity';
import { Profile, UserRole } from '../../common/entities/profile.entity';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { UsersService } from '../../users/services/users.service'; // To check user role/profile
import { Order } from 'src/common/entities/order.entity';

@Injectable()
export class ShopsService {
  findAll(): Shop[] | PromiseLike<Shop[]> {
      throw new Error('Method not implemented.');
  }
  private readonly logger = new Logger(ShopsService.name);

  constructor(
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>, // To verify profile roles etc.
    private usersService: UsersService, // To fetch user/profile details
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>
  ) {}

  /**
   * Creates a new shop for a vendor.
   * @param createShopDto Data to create the shop.
   * @param ownerId The ID of the vendor (profile.id) creating the shop.
   * @returns The created shop.
   */
  async createShop(createShopDto: CreateShopDto, ownerId: string): Promise<Shop> {
    const ownerProfile = await this.profilesRepository.findOne({ where: { id: ownerId } });

    if (!ownerProfile || ownerProfile.role !== UserRole.VENDOR) {
      throw new ForbiddenException('Only vendors can create shops.');
    }

    // Check if this vendor already owns a shop (assuming one shop per vendor for simplicity)
    const existingShop = await this.shopsRepository.findOne({ where: { ownerId } });
    if (existingShop) {
      throw new ConflictException('This vendor already owns a shop.');
    }

    const shop = this.shopsRepository.create({
      name: createShopDto.name,
      description: createShopDto.description,
      address: createShopDto.address,
      city: createShopDto.city,
      businessHours: createShopDto.businessHours,
      deliveryRadius: createShopDto.deliveryRadius,
      shopType: createShopDto.shopType || 'fruit_shop',
      phoneNumber: createShopDto.phoneNumber,
      email: createShopDto.email,
      website: createShopDto.website,
      status: 'pending',
      ownerId: ownerId,
      isActive: false, // Shops are inactive by default, until approved by admin
    });

    return this.shopsRepository.save(shop);
  }

  /**
   * Finds a shop by its owner's ID.
   * @param ownerId The ID of the shop owner (vendor).
   * @returns The shop details.
   */
  async findShopByOwnerId(ownerId: string): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { ownerId }, relations: ['owner'] });
    if (!shop) {
      throw new NotFoundException('Shop not found for this vendor.');
    }
    return shop;
  }

  /**
   * Updates a vendor's own shop.
   * @param ownerId The ID of the vendor (profile.id) whose shop is being updated.
   * @param updateShopDto Data to update the shop.
   * @returns The updated shop.
   */
  async updateShop(ownerId: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { ownerId } });

    if (!shop) {
      throw new NotFoundException('Shop not found for this vendor.');
    }

    // Prevent vendor from changing `isActive` status directly
    if (updateShopDto.hasOwnProperty('isActive')) {
      this.logger.warn(`Vendor ${ownerId} attempted to change isActive status of shop ${shop.id}. This action is restricted.`);
      delete updateShopDto.isActive; // Remove isActive from DTO if present
    }

    Object.assign(shop, updateShopDto);
    return this.shopsRepository.save(shop);
  }

  /**
   * Retrieves all active shops.
   * @returns A list of active shops.
   */
  async findAllActiveShops(): Promise<Shop[]> {
    return this.shopsRepository.find({
      where: { isActive: true },
      relations: ['owner'], // Eager load owner profile for display
      order: { name: 'ASC' },
    });
  }

  /**
   * Retrieves a single shop by ID (publicly accessible).
   * @param shopId The ID of the shop.
   * @returns The shop details.
   */
  async findShopById(shopId: string): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({
      where: { id: shopId, isActive: true }, // Only return active shops for public view
      relations: ['owner'],
    });
    if (!shop) {
      throw new NotFoundException('Shop not found or not active.');
    }
    return shop;
  }

  async findOrdersByOwnerId(ownerId: string): Promise<Order[]> {
  const shop = await this.findShopByOwnerId(ownerId);
  if (!shop) {
    throw new NotFoundException('Shop not found for the vendor.');
  }

  return this.ordersRepository.find({
    where: { shopId: shop.id },
    relations: ['orderItems', 'customer'],
    order: { createdAt: 'DESC' },
  });
}


  /**
   * Searches for shops by city and/or delivery radius.
   * @param city City to search in.
   * @param maxDeliveryRadius Maximum delivery radius.
   * @returns A list of matching active shops.
   */
  async searchShops(city?: string, maxDeliveryRadius?: number): Promise<Shop[]> {
    const queryBuilder = this.shopsRepository.createQueryBuilder('shop')
      .leftJoinAndSelect('shop.owner', 'ownerProfile') // Eager load owner profile
      .where('shop.isActive = :isActive', { isActive: true });

    if (city) {
      queryBuilder.andWhere('LOWER(shop.city) LIKE LOWER(:city)', { city: `%${city}%` });
    }
    if (maxDeliveryRadius) {
      // This is a simplified search. For accurate radius search, you'd need geographic coordinates.
      // Here, it just checks if the shop's set delivery radius is greater than or equal to the requested radius.
      queryBuilder.andWhere('shop.deliveryRadius >= :maxDeliveryRadius', { maxDeliveryRadius });
    }

    return queryBuilder.getMany();
  }
}