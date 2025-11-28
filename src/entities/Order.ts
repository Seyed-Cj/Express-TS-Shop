import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, user => user.orders)
  user!: User;

  @Column("float")
  total!: number;

  @Column({ default: "pending" })
  status!: string;

  @OneToMany(() => OrderItem, (orderItem: OrderItem) => orderItem.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}