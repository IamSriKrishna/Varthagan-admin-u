export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  UNDER_PROCESS = "under_process",
  PAID = "paid",
  FAILED = "failed",
  UNKNOWN = "unknown",
  FULFILLED = "fulfilled",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}
export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
  AMOUNT = "amount",
}
export const orderStatusOptions = [
  { label: "Pending", value: OrderStatus.PENDING },
  { label: "Processing", value: OrderStatus.PROCESSING },
  { label: "Delivered", value: OrderStatus.DELIVERED },
  { label: "Cancelled", value: OrderStatus.CANCELLED },
];

export const orderDiscountType = [
  { label: "Percentage", value: DiscountType.PERCENTAGE },
  { label: "Fixed", value: DiscountType.FIXED },
];
