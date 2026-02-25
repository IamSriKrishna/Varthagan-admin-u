import { OrderStatus } from "@/constants/ordersConstans";
import { ChipOwnProps } from "@mui/material";

export const orderStatusMUIColorMap: Record<OrderStatus, ChipOwnProps["color"]> = {
  [OrderStatus.PENDING]: "warning",
  [OrderStatus.PROCESSING]: "info",
  [OrderStatus.UNDER_PROCESS]: "warning",
  [OrderStatus.SHIPPED]: "primary",
  [OrderStatus.DELIVERED]: "success",
  [OrderStatus.CANCELLED]: "error",
  [OrderStatus.PAID]: "success",
  [OrderStatus.FAILED]: "error",
  [OrderStatus.UNKNOWN]: "default",
  [OrderStatus.FULFILLED]: "success",
};

export const getOrderStatusColor = (status: string): ChipOwnProps["color"] => {
  const normalized = status.toLowerCase() as OrderStatus;
  return orderStatusMUIColorMap[normalized] || "default";
};
