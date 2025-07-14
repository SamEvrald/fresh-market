// src/admin/services/admin.service.ts
import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm'; // Import MoreThan here
import { User } from '../../common/entities/user.entity';
import { Profile, UserRole } from '../../common/entities/profile.entity';
import { Shop } from '../../common/entities/shop.entity';
import { Order } from '../../common/entities/order.entity';

import { UsersService } from '../../users/services/users.service';
import { ShopsService } from '../../shops/services/shops.service';
import { OrdersService } from '../../orders/services/orders.service';

import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateShopStatusDto } from '../dto/update-shop-status.dto';
import { UpdateOrderStatusDto } from '../../orders/dto/update-order-status.dto';

@Injectable()
export class AdminService {
  // --- Dashboard Data ---
  async getDashboardStats() {
    // Example: count vendors, customers, orders, revenue
    const totalVendors = await this.profilesRepository.count({ where: { role: UserRole.VENDOR } });
    const totalCustomers = await this.profilesRepository.count({ where: { role: UserRole.CUSTOMER } });
    const totalOrders = await this.ordersRepository.count();
    const totalRevenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'totalRevenue')
      .where('order.status = :status', { status: 'paid' })
      .getRawOne();
    return {
      totalVendors,
      totalCustomers,
      totalOrders,
      totalRevenue: parseFloat(totalRevenueResult.totalRevenue || 0),
    };
  }

  async getPendingVendors() {
    // Example: shops with isActive === false
    const shops = await this.shopsRepository.find({ where: { isActive: false }, relations: ['owner'] });
    // Map to expected frontend shape
    return shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      owner: shop.owner?.fullName || '',
      date: shop.createdAt,
      status: 'pending',
    }));
  }

  async getRecentOrders() {
    // Example: last 10 orders
    const orders = await this.ordersRepository.find({
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['customer', 'shop'],
    });
    return orders.map(order => ({
      id: order.id,
      customer: order.customer?.fullName || '',
      vendor: order.shop?.name || '',
      amount: order.total_amount,
      status: order.status,
    }));
  }

  async getTopVendors() {
    // Example: top 5 vendors by revenue
    const result = await this.shopsRepository
      .createQueryBuilder('shop')
      .leftJoin('shop.orders', 'order')
      .select('shop.name', 'name')
      .addSelect('COUNT(order.id)', 'orders')
      .addSelect('SUM(order.total_amount)', 'revenue')
      .groupBy('shop.id')
      .orderBy('revenue', 'DESC')
      .limit(5)
      .getRawMany();
    // Add dummy rating for now
    return result.map(v => ({
      name: v.name,
      orders: Number(v.orders),
      revenue: Number(v.revenue),
      rating: 4.5,
    }));
  }
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    private usersService: UsersService,
    private shopsService: ShopsService,
    private ordersService: OrdersService,
  ) {}

  // --- User Management ---

  async findAllUsers(): Promise<User[]> {
    return this.usersRepository.find({ relations: ['profile'] });
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'profile.shops', 'profile.customerOrders', 'profile.reviews'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return user;
  }

  async updateUserRole(userId: string, updateUserRoleDto: UpdateUserRoleDto): Promise<Profile> {
    const profile = await this.profilesRepository.findOne({ where: { id: userId } });
    if (!profile) {
      throw new NotFoundException(`Profile for user ID ${userId} not found.`);
    }

    if (profile.role === UserRole.ADMIN && updateUserRoleDto.role !== UserRole.ADMIN) {
        // Prevent demoting the last admin if this logic is desired
        const adminCount = await this.profilesRepository.count({ where: { role: UserRole.ADMIN } });
        if (adminCount <= 1) {
            throw new BadRequestException('Cannot demote the last administrator.');
        }
    }

    profile.role = updateUserRoleDto.role;
    return this.profilesRepository.save(profile);
  }

  async toggleUserActiveStatus(userId: string, isActive: boolean): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['profile'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Ensure the profile exists and has the isActive property
    if (!user.profile) {
        throw new InternalServerErrorException('User profile not found for status update.');
    }

    if (user.profile.isActive === isActive) { // Access isActive from profile
      throw new ConflictException(`User is already ${isActive ? 'active' : 'inactive'}.`);
    }

    user.profile.isActive = isActive; // Update isActive on profile
    await this.profilesRepository.save(user.profile); // Save the profile
    return user; // Return the user object
  }

  // --- Shop Management ---

  async findAllShops(): Promise<Shop[]> {
    return this.shopsService.findAll(); // Corrected: Assuming ShopsService has a findAll method
  }

  async findShopById(shopId: string): Promise<Shop> {
    return this.shopsService.findShopById(shopId); // Corrected: Using findShopById
  }

  async updateShopStatus(shopId: string, updateShopStatusDto: UpdateShopStatusDto): Promise<Shop> {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found.`);
    }

    if (typeof updateShopStatusDto.isActive === 'boolean') {
      if (shop.isActive === updateShopStatusDto.isActive) {
        throw new ConflictException(`Shop is already ${updateShopStatusDto.isActive ? 'active' : 'inactive'}.`);
      }
      shop.isActive = updateShopStatusDto.isActive;
    }
    // Add logic for reason if needed, maybe log it or store it.

    return this.shopsRepository.save(shop);
  }

  // --- Order Management ---

  async findAllOrders(): Promise<Order[]> {
    return this.ordersService.findAllOrdersForAdmin();
  }

  async findOrderById(orderId: string): Promise<Order> {
    return this.ordersService.findOrderByIdForAdmin(orderId);
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    return this.ordersService.updateOrderStatus(
      'admin-system-id', // A placeholder or actual admin user ID
      orderId,
      updateOrderStatusDto,
      UserRole.ADMIN,
    );
  }

  // --- Reporting (Basic placeholders) ---

  async getSalesOverview(): Promise<any> {
    this.logger.warn('Sales overview report is a placeholder implementation.');
    const totalOrders = await this.ordersRepository.count();
    const totalRevenueResult = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'totalRevenue')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne();

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenueResult.totalRevenue || 0),
    };
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    this.logger.warn('Top products report is a placeholder implementation.');
    const topProducts = await this.ordersRepository
      .createQueryBuilder('order')
      .innerJoin('order.orderItems', 'orderItem')
      .innerJoin('orderItem.product', 'product')
      .select('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantitySold')
      .addSelect('SUM(orderItem.quantity * orderItem.priceAtOrder)', 'totalRevenue')
      .groupBy('product.id, product.name')
      .orderBy('totalQuantitySold', 'DESC')
      .limit(limit)
      .getRawMany();

    return topProducts;
  }

  async getNewRegistrations(days: number = 7): Promise<any> {
    this.logger.warn('New registrations report is a placeholder implementation.');
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const newUsers = await this.usersRepository.count({
      where: {
        createdAt: MoreThan(dateThreshold),
      },
    });

    const newShops = await this.shopsRepository.count({
      where: {
        createdAt: MoreThan(dateThreshold),
      },
    });

    return {
      periodInDays: days,
      newCustomers: newUsers,
      newShops: newShops,
    };
  }
}