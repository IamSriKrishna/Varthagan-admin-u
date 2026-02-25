export enum PaymentMethod {
  Razorpay = "razorpay",
  Cash = "cash",
  NotSpecified = "Not specified",
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Razorpay]: "Razorpay (Online)",
  [PaymentMethod.Cash]: "Cash Payment",
  [PaymentMethod.NotSpecified]: "Not specified",
};
export enum PaymentMethodTypes {
  UPI = "upi",
  Cash = "cash",
  Complete = "complete",
}
export enum PaymentStatus {
  // PAID = "paid",
  CAPTURED = "captured",
  SUCCESS = "success",
  FAILED = "failed",
  PENDING = "pending",
  REFUNDED = "refund",
}
export enum PaymentType {
  PRE_PAID = "pre_paid",
  POST_PAID = "post_paid",
}
export const paymentStatusOptions = [
  { label: "Pending", value: PaymentStatus.PENDING },
  { label: "Sucess", value: PaymentStatus.SUCCESS },
  { label: "Captured", value: PaymentStatus.CAPTURED },
  { label: "Failed", value: PaymentStatus.FAILED },
  { label: "Refund", value: PaymentStatus.REFUNDED },
];
export const paymentTypeOptions = [
  { label: "Pre-paid (Razorpay)", value: PaymentType.PRE_PAID },
  { label: "Pay at Salon", value: PaymentType.POST_PAID },
];
export const paymentOptions = [
  { label: "Cash", value: "cash" },
  { label: "Online", value: "online" },
];
