import { OrderStatus } from "@/lib/types";

export const ORIGIN_COUNTRIES = ["USA", "UK", "UAE", "China", "Turkey", "Saudi Arabia"] as const;

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "At Intl Warehouse",
  "In Transit",
  "Arrived in PK",
  "Out for Delivery",
  "Delivered"
];
