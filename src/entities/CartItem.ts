import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Cart } from "./Cart";
import { Product } from "./Product";

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: "CASCADE" })
  cart!: Cart;

  @ManyToOne(() => Product, product => product.cartItems)
  product!: Product;

  @Column()
  quantity!: number;
}