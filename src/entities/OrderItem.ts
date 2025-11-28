import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: "CASCADE" })
  order!: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  product!: Product;

  @Column()
  quantity!: number;

  @Column("float")
  price!: number;
}