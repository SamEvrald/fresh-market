// src/admin/controllers/admin.controller.ts
import { Controller, Get, Patch, Body, UseGuards, Param, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UpdateShopStatusDto } from '../dto/update-shop-status.dto';
import { UpdateOrderStatusDto } from '../../orders/dto/update-order-status.dto'; // Reuse existing DTO

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // All endpoints in this controller require ADMIN role
export class AdminController {
  // --- Dashboard Endpoints ---
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('pending-vendors')
  @HttpCode(HttpStatus.OK)
  async getPendingVendors() {
    return this.adminService.getPendingVendors();
  }

  @Get('recent-orders')
  @HttpCode(HttpStatus.OK)
  async getRecentOrders() {
    return this.adminService.getRecentOrders();
  }

  @Get('top-vendors')
  @HttpCode(HttpStatus.OK)
  async getTopVendors() {
    return this.adminService.getTopVendors();
  }
  constructor(private adminService: AdminService) {}

  // --- User Management ---

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUserById(@Param('id') userId: string) {
    return this.adminService.findUserById(userId);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(@Param('id') userId: string, @Body() updateUserRoleDto: UpdateUserRoleDto) {
    return this.adminService.updateUserRole(userId, updateUserRoleDto);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  async activateUser(@Param('id') userId: string) {
    return this.adminService.toggleUserActiveStatus(userId, true);
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  async deactivateUser(@Param('id') userId: string) {
    return this.adminService.toggleUserActiveStatus(userId, false);
  }

  // --- Shop Management ---

  @Get('shops')
  @HttpCode(HttpStatus.OK)
  async getAllShops() {
    return this.adminService.findAllShops();
  }

  @Get('shops/:id')
  @HttpCode(HttpStatus.OK)
  async getShopById(@Param('id') shopId: string) {
    return this.adminService.findShopById(shopId);
  }

  @Patch('shops/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateShopStatus(@Param('id') shopId: string, @Body() updateShopStatusDto: UpdateShopStatusDto) {
    return this.adminService.updateShopStatus(shopId, updateShopStatusDto);
  }

  // --- Order Management ---

  @Get('orders')
  @HttpCode(HttpStatus.OK)
  async getAllOrders() {
    return this.adminService.findAllOrders();
  }

  @Get('orders/:id')
  @HttpCode(HttpStatus.OK)
  async getOrderById(@Param('id') orderId: string) {
    return this.adminService.findOrderById(orderId);
  }

  @Patch('orders/:id/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(@Param('id') orderId: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.adminService.updateOrderStatus(orderId, updateOrderStatusDto);
  }

  // --- Reporting ---

  @Get('reports/sales-overview')
  @HttpCode(HttpStatus.OK)
  async getSalesOverview() {
    return this.adminService.getSalesOverview();
  }

  @Get('reports/top-products')
  @HttpCode(HttpStatus.OK)
  async getTopProducts(@Query('limit') limit: number = 10) {
    return this.adminService.getTopProducts(Number(limit));
  }

  @Get('reports/new-registrations')
  @HttpCode(HttpStatus.OK)
  async getNewRegistrations(@Query('days') days: number = 7) {
    return this.adminService.getNewRegistrations(Number(days));
  }
}