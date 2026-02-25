// utils/getRazorpayOptions.ts
import { PaymentMethodTypes } from "@/constants/payment";
import { IOrderList } from "@/models/IOrders";
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  customer?: {
    name: string;
    email: string;
  };
  theme?: {
    color: string;
  };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  modal?: {
    ondismiss: () => void;
  };
}
interface RazorpayOrder {
  id: string;
}

interface BuildRazorpayOptionsParams {
  order: IOrderList;
  razorpayOrder: RazorpayOrder;
  onComplete: (paymentMethod: PaymentMethodTypes) => void;
  onDismiss?: () => void;
  key: string;
}

export const buildRazorpayOptions = ({
  order,
  razorpayOrder,
  onComplete,
  onDismiss,
  key,
}: BuildRazorpayOptionsParams): RazorpayOptions => {
  return {
    key,
    amount: order.total_amount * 100,
    currency: "INR",
    name: "Beauty Booking",
    description: order.description || "Service Payment",
    order_id: razorpayOrder.id,
    customer: {
      name: order.customer_name || "Customer",
      email: "customer@example.com",
    },
    theme: {
      color: "#1976d2",
    },
    handler(response) {
      console.log("Razorpay payment success:", response);
      onComplete(PaymentMethodTypes.UPI);
    },
    modal: {
      ondismiss() {
        console.log("Razorpay checkout closed");
        onDismiss?.();
      },
    },
  };
};
