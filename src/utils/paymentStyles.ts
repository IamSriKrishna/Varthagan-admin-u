import { PaymentStatus } from "@/constants/payment";
import { ChipOwnProps } from "@mui/material";

export const paymentStatusColors: Partial<Record<PaymentStatus, ChipOwnProps["color"]>> = {
  // [PaymentStatus.PAID]: "success",
  [PaymentStatus.CAPTURED]: "success",
  [PaymentStatus.SUCCESS]: "success",
  [PaymentStatus.FAILED]: "error",
  [PaymentStatus.PENDING]: "warning",
};

export const getPaymentStatusColor = (status: string): ChipOwnProps["color"] => {
  const key = status.toLowerCase() as PaymentStatus;
  return paymentStatusColors[key] ?? "default";
};
