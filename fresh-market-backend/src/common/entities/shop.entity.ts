// src/common/entities/shop.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Profile } from './profile.entity'; // Import Profile entity
import { Product } from './product.entity'; // Will be created later for ProductsModule
import { Order } from './order.entity'; // Will be created later for OrdersModule
import { Review } from './review.entity'; // Will be created later for ReviewsModule

@Entity('shops')
export class Shop {
  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'website', nullable: true })
  website: string;

  @Column({ name: 'status', default: 'pending' })
  status: string;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string; // Foreign key column

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ name: 'business_hours', nullable: true })
  businessHours: string;

  @Column({ name: 'delivery_radius', default: 5 })
  deliveryRadius: number;

  @Column({ name: 'shop_type', default: 'fruit_shop' })
  shopType: string;

  @Column({ name: 'is_active', default: false })
  isActive: boolean; // For admin to activate/deactivate shops

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Profile, profile => profile.shops)
  @JoinColumn({ name: 'owner_id' }) // This links ownerId to Profile.id
  owner: Profile;

  @OneToMany(() => Product, product => product.shop)
  products: Product[];

  // Removed relation to Order entity, use shop_id in Order for queries

  @OneToMany(() => Review, review => review.shop)
  reviews: Review[];
  orders: any;

  
}