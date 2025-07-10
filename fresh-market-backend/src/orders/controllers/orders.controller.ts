// src/orders/controllers/orders.controller.ts
import { Controller, Post, Get, Patch, Body, UseGuards, Request, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';

@Controller() // Use a root controller to handle different base paths
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // --- Customer Endpoints ---

  @Post('orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // req.user.id is the customer's profile ID
    const order = await this.ordersService.createOrder(createOrderDto, req.user.id);
    return { message: 'Order placed successfully!', order };
  }

  @Get('customers/me/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async getMyOrders(@Request() req) {
    return this.ordersService.findOrdersByCustomerId(req.user.id);
  }

  @Get('customers/me/orders/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  async getMyOrder(@Request() req, @Param('orderId') orderId: string) {
    return this.ordersService.findOneOrderByCustomer(req.user.id, orderId);
  }

  // --- Vendor Endpoints ---

  @Get('shops/me/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  async getShopOrders(@Request() req) {
    // req.user.id is the vendor's profile ID
    return this.ordersService.findOrdersByVendorId(req.user.id);
  }

  @Get('shops/me/orders/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  async getShopOrder(@Request() req, @Param('orderId') orderId: string) {
    // req.user.id is the vendor's profile ID
    return this.ordersService.findOneOrderByVendor(req.user.id, orderId);
  }

  @Patch('shops/me/orders/:orderId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  async updateShopOrderStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user.id, orderId, updateStatusDto, req.user.profile.role);
  }

  // --- Admin Endpoints (Optional, but good to define) ---
  @Get('orders') // All orders (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getAllOrdersForAdmin() {
    return this.ordersService.findAllOrdersForAdmin();
  }

  @Get('orders/:orderId') // Single order (Admin only)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getOrderByIdForAdmin(@Param('orderId') orderId: string) {
    return this.ordersService.findOrderByIdForAdmin(orderId);
  }

  @Patch('orders/:orderId/status') // Update status (Admin can also do this)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateOrderStatusByAdmin(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user.id, orderId, updateStatusDto, req.user.profile.role);
  }
}