// src/orders/services/orders.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource for transactions
import { Order } from '../../common/entities/order.entity';
import { OrderItem } from '../../common/entities/order-item.entity';
import { Product } from '../../common/entities/product.entity';
import { Profile, UserRole } from '../../common/entities/profile.entity';
import { Shop } from '../../common/entities/shop.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { EmailService } from '../../notifications/services/email.service'; // For notifications
import { SocketGateway } from '../../socket/socket.gateway'; // adjust path as needed


@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>,
    private dataSource: DataSource, // Inject DataSource for transactions
    private emailService: EmailService, // Inject EmailService
    private readonly socketGateway: SocketGateway,
  ) { }

  /**
   * Creates a new order by a customer.
   * @param createOrderDto Order details including items.
   * @param customerId The ID of the authenticated customer.
   * @returns The created order.
   */
  async createOrder(createOrderDto: CreateOrderDto, customerId: string): Promise<Order> {
    const { shopId, items, shippingAddress, contactPhone, paymentMethod } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const customerProfile = await this.profilesRepository.findOne({ where: { id: customerId } });
      if (!customerProfile || customerProfile.role !== UserRole.CUSTOMER) {
        throw new ForbiddenException('Only customers can place orders.');
      }

      const shop = await this.shopsRepository.findOne({ where: { id: shopId, isActive: true } });
      if (!shop) {
        throw new NotFoundException('Shop not found or not active.');
      }

      let totalOrderPrice = 0;
      const orderItemsEntities: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: itemDto.productId, shopId: shopId } });

        if (!product || !product.isAvailable) {
          throw new BadRequestException(`Product with ID ${itemDto.productId} not found or not available in this shop.`);
        }

        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${itemDto.quantity}`);
        }

        const orderItem = this.orderItemsRepository.create({
          product: product,
          priceAtOrder: product.price,
          quantity: itemDto.quantity,
        });
        orderItemsEntities.push(orderItem);
        totalOrderPrice += product.price * itemDto.quantity;

        // Decrement product stock
        product.stockQuantity -= itemDto.quantity;
        await queryRunner.manager.save(Product, product);
      }

      const order = this.ordersRepository.create({
        customer: customerProfile,
        shop: shop,
        totalPrice: totalOrderPrice,
        shippingAddress,
        contactPhone: contactPhone || customerProfile.phone, // Use customer's phone if not provided
        paymentMethod,
        status: OrderStatus.PENDING,
        orderItems: orderItemsEntities,
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      await queryRunner.commitTransaction();
      this.socketGateway.server.emit('orderCreated', {
        id: savedOrder.id,
        shopId: savedOrder.shopId,
        status: savedOrder.status,
        customerId: savedOrder.customerId,
        createdAt: savedOrder.createdAt,
      });


      // Send order confirmation email
      try {
        await this.emailService.sendOrderConfirmationEmail(
          customerProfile.user.email, // Assuming profile.user.email is accessible
          customerProfile.fullName || customerProfile.user.email,
          savedOrder,
        );
      } catch (emailError) {
        this.logger.error(`Failed to send order confirmation email to ${customerProfile.user.email}:`, emailError.stack);
      }

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Error creating order:', err.stack);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves all orders for the authenticated customer.
   * @param customerId The ID of the authenticated customer.
   * @returns List of orders.
   */
  async findOrdersByCustomerId(customerId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerId },
      relations: ['shop', 'orderItems', 'orderItems.product'], // Eager load necessary data
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single order for the authenticated customer.
   * @param customerId The ID of the authenticated customer.
   * @param orderId The ID of the order.
   * @returns The order details.
   */
  async findOneOrderByCustomer(customerId: string, orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, customerId: customerId },
      relations: ['shop', 'orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found or does not belong to you.');
    }
    return order;
  }

  /**
   * Retrieves all orders for a vendor's shop.
   * @param vendorId The ID of the authenticated vendor.
   * @returns List of orders.
   */
  async findOrdersByVendorId(vendorId: string): Promise<Order[]> {
    const shop = await this.shopsRepository.findOne({ where: { ownerId: vendorId } });
    if (!shop) {
      throw new NotFoundException('Vendor does not own an active shop.');
    }
    return this.ordersRepository.find({
      where: { shopId: shop.id },
      relations: ['customer', 'orderItems', 'orderItems.product'], // Eager load customer, products
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Retrieves a single order for a vendor's shop.
   * @param vendorId The ID of the authenticated vendor.
   * @param orderId The ID of the order.
   * @returns The order details.
   */
  async findOneOrderByVendor(vendorId: string, orderId: string): Promise<Order> {
    const shop = await this.shopsRepository.findOne({ where: { ownerId: vendorId } });
    if (!shop) {
      throw new NotFoundException('Vendor does not own an active shop.');
    }
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, shopId: shop.id },
      relations: ['customer', 'orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found or does not belong to your shop.');
    }
    return order;
  }

  /**
   * Updates the status of an order (vendor/admin).
   * @param updaterId The ID of the user updating the order.
   * @param orderId The ID of the order.
   * @param updateStatusDto New status and optional payment status.
   * @param userRole Role of the user updating (for permission check).
   * @returns The updated order.
   */
  async updateOrderStatus(
    updaterId: string,
    orderId: string,
    updateStatusDto: UpdateOrderStatusDto,
    userRole: UserRole,
  ): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'shop'], // Load customer and shop for email and ownership
    });

    if (!order) {
      throw new NotFoundException('Order not found.');
    }

    // Permission check
    if (userRole === UserRole.VENDOR) {
      const shop = await this.shopsRepository.findOne({ where: { ownerId: updaterId } });
      if (!shop || shop.id !== order.shopId) {
        throw new ForbiddenException('You are not authorized to update this order.');
      }
    } else if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only vendors and admins can update order status.');
    }

    // Basic status transition validation (can be more complex)
    if (order.status === OrderStatus.CANCELLED || order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException(`Cannot change status of an order that is already ${order.status}.`);
    }

    // Allow status update
    order.status = updateStatusDto.status;
    if (updateStatusDto.paymentStatus) {
      order.paymentStatus = updateStatusDto.paymentStatus;
    }

    const updatedOrder = await this.ordersRepository.save(order);
    this.socketGateway.server.emit('orderUpdated', {
      id: updatedOrder.id,
      shopId: updatedOrder.shopId,
      status: updatedOrder.status,
      customerId: updatedOrder.customerId,
      updatedAt: updatedOrder.updatedAt,
    });


    // Send order status update email
    try {
      await this.emailService.sendOrderStatusUpdateEmail(
        order.customer.user.email,
        order.customer.fullName || order.customer.user.email,
        updatedOrder,
      );
    } catch (emailError) {
      this.logger.error(`Failed to send order status update email to ${order.customer.user.email}:`, emailError.stack);
    }

    return updatedOrder;
  }

  /**
   * Admin/Internal method: Get any order by ID.
   */
  async findOrderByIdForAdmin(orderId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'shop', 'orderItems', 'orderItems.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found.');
    }
    return order;
  }

  /**
   * Admin/Internal method: Get all orders.
   */
  async findAllOrdersForAdmin(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['customer', 'shop', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });
  }
}