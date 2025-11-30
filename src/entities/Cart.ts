import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { CartItem } from './CartItem';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User, (user) => user.cart)
  user!: User;

  @OneToMany(() => CartItem, (cartItem: CartItem) => cartItem.cart, { cascade: true })
  items!: CartItem[];
}
