// src/common/entities/profile.entity.ts
import { Entity, PrimaryColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Shop } from './shop.entity';
import { Order } from './order.entity';
import { Review } from './review.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

@Entity('profiles')
export class Profile {
  @PrimaryColumn('uuid') // This will match the user's ID
  id: string;

  @Column({ name: 'full_name', nullable: true })
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User, user => user.profile)
  user: User;
  
  @OneToMany(() => Shop, shop => shop.owner)
  shops: Shop[];

  // Removed relation to Order entity, use customer_id in Order for queries

  @OneToMany(() => Review, review => review.customer) // Add this relation for customer's reviews
  reviews: Review[];
    isActive: boolean;
  customerOrders: any;
}