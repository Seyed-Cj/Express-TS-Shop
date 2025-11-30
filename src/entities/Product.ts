import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CartItem } from './CartItem';
import { OrderItem } from './OrderItem';
import { Category } from './Category';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('float')
  price!: number;

  @Column('int', { default: 0 })
  stock!: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => Category, (category) => category.products)
  category?: Category;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: true })
  isActive!: boolean;
}