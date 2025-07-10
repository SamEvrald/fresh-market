// src/common/entities/review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Product } from './product.entity';
import { Shop } from './shop.entity';
import { Profile } from './profile.entity'; // The customer who wrote the review

@Entity('reviews')
@Check(`"product_id" IS NOT NULL OR "shop_id" IS NOT NULL`, 'review_target_check') // Ensure either product_id or shop_id is set
@Check(`"product_id" IS NULL OR "shop_id" IS NULL`, 'review_single_target_check') // Ensure only one of product_id or shop_id is set
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string; // The customer (Profile) who wrote the review

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null; // Nullable, as it could be a shop review

  @Column({ name: 'shop_id', type: 'uuid', nullable: true })
  shopId: string | null; // Nullable, as it could be a product review

  @Column({ type: 'int' })
@Check(`"rating" >= 1 AND "rating" <= 5`, 'rating_range_check') // Added a unique name 'rating_range_check'
rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Profile, profile => profile.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Profile;

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @ManyToOne(() => Shop, shop => shop.reviews, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop | null;
}