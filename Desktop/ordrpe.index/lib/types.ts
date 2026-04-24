export type Role = "admin" | "vendor" | "customer";

export type OrderStatus =
  | "Pending"
  | "At Intl Warehouse"
  | "In Transit"
  | "Arrived in PK"
  | "Out for Delivery"
  | "Delivered";
