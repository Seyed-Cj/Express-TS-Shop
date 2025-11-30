import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from './CartItem';
import { OrderItem } from './OrderItem';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('float')
  price!: number;

  @Column()
  stock!: number;

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.product)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.product)
  orderItems!: OrderItem[];
}
