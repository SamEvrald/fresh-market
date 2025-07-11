// src/products/services/products.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../common/entities/product.entity';
import { Shop } from '../../common/entities/shop.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SearchProductsDto } from '../dto/search-products.dto';
import { ShopsService } from '../../shops/services/shops.service'; // To verify shop ownership

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Shop)
    private shopsRepository: Repository<Shop>, // Inject Shop repository to check ownership
    private shopsService: ShopsService, // To use existing shop service methods
  ) {}

  /**
   * Creates a new product for a vendor's shop.
   * @param createProductDto Product data.
   * @param ownerId The ID of the authenticated vendor (profile.id).
   * @param imageUrl The path to the uploaded image.
   * @returns The created product.
   */
  async createProduct(createProductDto: CreateProductDto, ownerId: string, imageUrl: string): Promise<Product> {
    const shop = await this.shopsService.findShopByOwnerId(ownerId); // This ensures the shop belongs to the owner
    if (!shop) {
      throw new NotFoundException('Vendor does not own an active shop.');
    }

    const product = this.productsRepository.create({
      ...createProductDto,
      shopId: shop.id,
      imageUrl: imageUrl, // Save the path to the image
    });

    return this.productsRepository.save(product);
  }

  /**
   * Finds all products belonging to a specific vendor's shop.
   * @param ownerId The ID of the authenticated vendor.
   * @returns A list of products.
   */
  async findAllProductsByOwner(ownerId: string): Promise<Product[]> {
    const shop = await this.shopsService.findShopByOwnerId(ownerId);
    if (!shop) {
      throw new NotFoundException('Vendor does not own an active shop.');
    }

    return this.productsRepository.find({
      where: { shopId: shop.id },
      order: { name: 'ASC' },
    });
  }

  /**
   * Finds a specific product owned by a vendor.
   * @param ownerId The ID of the authenticated vendor.
   * @param productId The ID of the product.
   * @returns The product details.
   */
  async findOneProductByOwner(ownerId: string, productId: string): Promise<Product> {
    const shop = await this.shopsService.findShopByOwnerId(ownerId);
    if (!shop) {
      throw new NotFoundException('Vendor does not own an active shop.');
    }

    const product = await this.productsRepository.findOne({
      where: { id: productId, shopId: shop.id }, // Ensure product belongs to this vendor's shop
    });

    if (!product) {
      throw new NotFoundException('Product not found or does not belong to your shop.');
    }
     console.log('[findAllProductsByOwner] Products:', product);
    return product;
  }

  /**
   * Updates a product owned by a vendor.
   * @param ownerId The ID of the authenticated vendor.
   * @param productId The ID of the product to update.
   * @param updateProductDto Product update data.
   * @param imageUrl Optional new image URL.
   * @returns The updated product.
   */
  async updateProduct(ownerId: string, productId: string, updateProductDto: UpdateProductDto, imageUrl?: string): Promise<Product> {
    const product = await this.findOneProductByOwner(ownerId, productId); // Re-uses ownership check

    Object.assign(product, updateProductDto);
    if (imageUrl) {
      product.imageUrl = imageUrl;
    }

    return this.productsRepository.save(product);
  }

  /**
   * Deletes a product owned by a vendor.
   * @param ownerId The ID of the authenticated vendor.
   * @param productId The ID of the product to delete.
   */
  async deleteProduct(ownerId: string, productId: string): Promise<void> {
    const product = await this.findOneProductByOwner(ownerId, productId); // Re-uses ownership check
    await this.productsRepository.remove(product);
  }

  /**
   * Publicly accessible: Finds all products for a specific active shop.
   * @param shopId The ID of the shop.
   * @returns List of available products.
   */
  async findProductsByShopId(shopId: string): Promise<Product[]> {
    const shop = await this.shopsRepository.findOne({ where: { id: shopId, isActive: true } });
    if (!shop) {
      throw new NotFoundException('Shop not found or not active.');
    }

    return this.productsRepository.find({
      where: { shopId: shop.id, isAvailable: true },
      order: { name: 'ASC' },
    });
  }

  /**
   * Publicly accessible: Finds a single available product by ID.
   * @param productId The ID of the product.
   * @returns The product details.
   */
  async findProductById(productId: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, isAvailable: true },
      relations: ['shop'], // Eager load shop details
    });
    if (!product || !product.shop.isActive) { // Also check if the associated shop is active
      throw new NotFoundException('Product not found or not available.');
    }
    return product;
  }

  /**
   * Publicly accessible: Searches for products across all active shops.
   * @param queryDto Search criteria.
   * @returns List of matching available products.
   */
  async searchProducts(queryDto: SearchProductsDto): Promise<Product[]> {
    const queryBuilder = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.shop', 'shop') // Join with shop to filter by active shops
      .where('product.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('shop.isActive = :shopIsActive', { shopIsActive: true }); // Only show products from active shops

    if (queryDto.name) {
      queryBuilder.andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${queryDto.name}%` });
    }
    if (queryDto.category) {
      queryBuilder.andWhere('LOWER(product.category) LIKE LOWER(:category)', { category: `%${queryDto.category}%` });
    }
    if (queryDto.shopId) {
      queryBuilder.andWhere('product.shopId = :shopId', { shopId: queryDto.shopId });
    }
    if (queryDto.minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: parseFloat(queryDto.minPrice) });
    }
    if (queryDto.maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: parseFloat(queryDto.maxPrice) });
    }
    if (queryDto.isAvailable != null) { // handles both null and undefined
  const isAvailableBoolean = queryDto.isAvailable === 'true';
  queryBuilder.andWhere('product.isAvailable = :isAvailableParam', { isAvailableParam: isAvailableBoolean });
}


    return queryBuilder.getMany();
  }
}