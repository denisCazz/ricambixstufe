export type UserRole = "customer" | "dealer" | "admin";
export type DealerStatus = "pending" | "approved" | "rejected";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "paypal" | "bank_transfer" | "cod" | "stripe";
