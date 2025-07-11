// src/products/controllers/products.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchProductsDto } from '../dto/search-products.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/entities/profile.entity';


// Define the destination for product images
const productsUploadDir = join(process.cwd(), 'uploads', 'products');

@Controller() // Use a root controller to handle different base paths
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  // --- Vendor-specific Endpoints (/shops/me/products) ---

  @Post('shops/me/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: productsUploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB limit
      },
    }),
  )
  async createProduct(
    @Request() req,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) {
      throw new BadRequestException('Product image is required.');
    }
    const imageUrl = `/uploads/products/${image.filename}`; // Store relative path

    const product = await this.productsService.createProduct(createProductDto, req.user.id, imageUrl);
    return { message: 'Product added successfully!', product };
  }

  @Get('shops/me/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  async getMyProducts(@Request() req) {
    return this.productsService.findAllProductsByOwner(req.user.id);
  }

  @Get('shops/me/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  async getMyProduct(@Request() req, @Param('productId') productId: string) {
    return this.productsService.findOneProductByOwner(req.user.id, productId);
  }

  @Patch('shops/me/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: productsUploadDir,
        filename: (req, file, cb) => {
          const uniqueSuffix = uuidv4();
          const fileExtName = extname(file.originalname);
          cb(null, `${uniqueSuffix}${fileExtName}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 5, // 5 MB limit
      },
    }),
  )
  async updateMyProduct(
    @Request() req,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imageUrl = image ? `/uploads/products/${image.filename}` : undefined;
    const updatedProduct = await this.productsService.updateProduct(
      req.user.id,
      productId,
      updateProductDto,
      imageUrl,
    );
    return { message: 'Product updated successfully!', product: updatedProduct };
  }

  @Delete('shops/me/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.VENDOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyProduct(@Request() req, @Param('productId') productId: string) {
    // TODO: Add logic to delete the actual file from storage if desired
    await this.productsService.deleteProduct(req.user.id, productId);
  }

  // --- Customer/Public-facing Endpoints ---

  @Get('shops/:shopId/products')
  @HttpCode(HttpStatus.OK)
  async getProductsByShopId(@Param('shopId') shopId: string) {
    return this.productsService.findProductsByShopId(shopId);
  }

  @Get('products/search')
  @HttpCode(HttpStatus.OK)
  async searchProducts(@Query() searchProductsDto: SearchProductsDto) {
    return this.productsService.searchProducts(searchProductsDto);
  }

  @Get('products/:productId')
  @HttpCode(HttpStatus.OK)
  async getProductById(@Param('productId') productId: string) {
    return this.productsService.findProductById(productId);
  }

  @Get('products')
@HttpCode(HttpStatus.OK)
async getAvailableProducts(@Query() searchProductsDto: SearchProductsDto) {
  return this.productsService.searchProducts(searchProductsDto);
}

}