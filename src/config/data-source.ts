import "reflect-metadata";
import { DataSource } from "typeorm";
// import { User } from "../entities/User";
// import { Product } from "../entities/Product";
// import { Cart } from "../entities/Cart";
// import { CartItem } from "../entities/CartItem";
// import { Order } from "../entities/Order";
// import { OrderItem } from "../entities/OrderItem";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres", 
  password: "password",
  database: "tshop",
  synchronize: true, 
  logging: true,
  // entities: [User, Product, Cart, CartItem, Order, OrderItem],
  migrations: [],
  subscribers: [],
});
