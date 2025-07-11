// src/common/entities/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Profile } from './profile.entity'; // Customer who placed the order
import { Shop } from './shop.entity';     // Shop from which the order was placed
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../enums/order-status.enum'; // Import the enum

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string; // Foreign key to Profile (customer)

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string; // Foreign key to Shop

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'numeric', name: 'total_amount' })
total_amount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'shipping_address' })
  shippingAddress: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string; // e.g., 'MOMO', 'Card', 'Cash on Delivery'

  @Column({ name: 'payment_status', default: 'pending' })
  paymentStatus: string; // e.g., 'pending', 'paid', 'failed'

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
  


  // Relations
  @ManyToOne(() => Profile, profile => profile.customerOrders)
  @JoinColumn({ name: 'customer_id' })
  customer: Profile;

  @ManyToOne(() => Shop, shop => shop.orders)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true, eager: true }) // Cascade on order deletion, eager load items
  orderItems: OrderItem[];
}