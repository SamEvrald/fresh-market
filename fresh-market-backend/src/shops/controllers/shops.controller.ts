// src/shops/controllers/shops.controller.ts
import { Controller, Post, Get, Patch, Body, UseGuards, Request, HttpCode, HttpStatus, Param, Query } from '@nestjs/common';
import { ShopsService } from '../services/shops.service';
import { CreateShopDto } from '../dto/create-shop.dto';
import { UpdateShopDto } from '../dto/update-shop.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';
import { FindManyOptions } from 'typeorm'; // For TypeORM query options
import { ProductsService } from '../../products/services/products.service';

@Controller('shops')
export class ShopsController {
  constructor(
    private shopsService: ShopsService,
    private productsService: ProductsService, // Inject ProductsService
  ) {}

  // --- Vendor-specific Endpoints ---

@Post('/')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@HttpCode(HttpStatus.CREATED)
async createShop(@Request() req, @Body() createShopDto: CreateShopDto) {
  const shop = await this.shopsService.createShop(createShopDto, req.user.id);
  return { message: 'Shop created successfully, awaiting admin activation.', shop };
}

@Get('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@HttpCode(HttpStatus.OK)
async getMyShop(@Request() req) {
  const shop = await this.shopsService.findShopByOwnerId(req.user.id);
  return shop;
}

@Patch('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@HttpCode(HttpStatus.OK)
async updateMyShop(@Request() req, @Body() updateShopDto: UpdateShopDto) {
  const updatedShop = await this.shopsService.updateShop(req.user.id, updateShopDto);
  return { message: 'Shop updated successfully.', shop: updatedShop };
}

// ✅ MOVE THIS HERE
@Get('me/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@HttpCode(HttpStatus.OK)
async getMyProducts(@Request() req) {
  console.log('[getMyProducts] Vendor ID:', req.user.id);
  return this.productsService.findAllProductsByOwner(req.user.id);
}

@Get('me/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.VENDOR)
@HttpCode(HttpStatus.OK)
async getMyOrders(@Request() req) {
  return this.shopsService.findOrdersByOwnerId(req.user.id);
}


// --- Customer/Public-facing Endpoints ---

@Get('/')
@HttpCode(HttpStatus.OK)
async getAllActiveShops() {
  return this.shopsService.findAllActiveShops();
}

@Get('search')
@HttpCode(HttpStatus.OK)
async searchShops(
  @Query('city') city?: string,
  @Query('deliveryRadius') deliveryRadius?: number,
) {
  return this.shopsService.searchShops(city, deliveryRadius);
}

// ❗️MUST BE LAST
@Get(':shopId')
@HttpCode(HttpStatus.OK)
async getShopById(@Param('shopId') shopId: string) {
  return this.shopsService.findShopById(shopId);
}
  
}