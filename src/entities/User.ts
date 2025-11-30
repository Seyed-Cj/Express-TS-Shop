import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Order } from './Order';
import { Cart } from './Cart';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 'customer' })
  role!: string;

  @OneToMany(() => Order, (order: Order) => order.user)
  orders!: Order[];

  @OneToOne(() => Cart, (cart: Cart) => cart.user)
  @JoinColumn()
  cart!: Cart;
}
