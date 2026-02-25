import { config } from "@/config";
import { payments } from "@/constants/apiConstants";
import { PaymentMethodTypes, PaymentStatus } from "@/constants/payment";
import useApi from "@/hooks/useApi";
import { BBButton, BBDialog } from "@/lib";
import { IOrderList } from "@/models/IOrders";
import { buildRazorpayOptions, RazorpayOptions } from "@/utils/getRazorpayOptions";
import { showToastMessage } from "@/utils/toastUtil";
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Typography } from "@mui/material";
import { CheckCircle, CreditCard, QrCode } from "lucide-react";
import React, { useEffect, useState } from "react";
import * as classes from "./PaymentDialog.styles";
interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  offer_id: string;
  status: string;
  attempts: number;
  notes: {
    description: string;
    internal_order_id: string;
  };
  created_at: number;
}

// The API response is directly a RazorpayOrder object, not wrapped
type SubmitPaymentResponse = RazorpayOrder;
interface RazorpayInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  order: IOrderList | null;
  onPaymentComplete: (paymentMethod: PaymentMethodTypes) => void;
  loading?: boolean;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onClose,
  order,
  onPaymentComplete,
  loading = false,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodTypes | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const { mutateApi: submitPayment } = useApi<SubmitPaymentResponse>(
    payments.postPayment,
    "POST",
    undefined,
    config.orderDomain,
  );

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      setIsPolling(false);
      setPollAttempts(0);
    };
  }, []);

  const handleUPIPayment = async () => {
    if (!order) return;

    setPaymentMethod(PaymentMethodTypes.UPI);

    try {
      // Load Razorpay SDK dynamically if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      const payload = {
        order_id: order.id,
        amount: order.total_amount,
        currency: "INR",
        description: order.description || "Admin Service Payment",
      };
      const orderData = await submitPayment(payload);

      if (!orderData?.id) {
        throw new Error("Razorpay order ID not received");
      }

      // Open Razorpay checkout
      const options = buildRazorpayOptions({
        order,
        razorpayOrder: orderData,
        onComplete: onPaymentComplete,
        onDismiss: () => setPaymentMethod(null),
        key: config.razorpay.keyId || "",
      });

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error initiating Razorpay payment:", error);
      setPaymentMethod(null);
      // You might want to show an error message here
    }
  };

  const handleCashPayment = () => {
    setPaymentMethod(PaymentMethodTypes.Cash);
  };

  const confirmPayment = async () => {
    if (!order || !paymentMethod) return;

    try {
      // For cash payments, let the parent handle the API call
      // Just call the completion handler to trigger parent logic
      onPaymentComplete(paymentMethod);
      handleClose();
    } catch (e) {
      console.error("Error confirming payment:", e);
      // You might want to show an error message here
      // alert("Failed to confirm payment. Please try again.");
      const errorMessage =
        typeof e == "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const handleClose = () => {
    setPaymentMethod(null);
    setIsPolling(false);
    setPollAttempts(0);
    onClose();
  };

  // Backend returns payment status in 'payment_status' field
  const paymentStatus = (order?.payment_status || PaymentStatus.PENDING).toLowerCase(); // Default to pending and normalize case
  const isPostPaid = paymentStatus == PaymentStatus.PENDING;
  const isPaid =
    // paymentStatus == PaymentStatus.PAID ||
    paymentStatus === PaymentStatus.SUCCESS || paymentStatus === PaymentStatus.CAPTURED;

  // Debug logging
  // console.log("PaymentDialog - Order payment status (payment_status field):", order?.payment_status);
  // console.log("PaymentDialog - Calculated paymentStatus (normalized):", paymentStatus);
  // console.log("PaymentDialog - isPostPaid:", isPostPaid);
  // console.log("PaymentDialog - isPaid:", isPaid);

  return (
    <>
      <BBDialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        title="Complete Payment"
        content={
          <>
            {order && (
              <Box sx={{ mb: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Order Details
                    </Typography>
                    <Box sx={classes.orderDetailRow}>
                      <Typography variant="body2">Order ID:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {order.id}
                      </Typography>
                    </Box>
                    <Box sx={classes.orderDetailRow}>
                      <Typography variant="body2">Customer:</Typography>
                      <Typography variant="body2">{order.customer_name || order.customer_id}</Typography>
                    </Box>
                    <Box sx={classes.orderDetailRow}>
                      <Typography variant="body2">Product:</Typography>
                      <Typography variant="body2">{order.product_name || "Service"}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={classes.totalAmountRow}>
                      <Typography variant="h6">Total Amount:</Typography>
                      <Typography variant="h6" color="primary">
                        ₹{order.total_amount}
                      </Typography>
                    </Box>
                    <Box sx={{ ...classes.totalAmountRow, mt: 1 }}>
                      <Typography variant="body2">Payment Status:</Typography>
                      <Chip
                        label={isPostPaid ? "Pending Payment" : "Payment Completed"}
                        color={isPostPaid ? "warning" : "success"}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {isPostPaid && (
              <Alert severity="info" sx={{ mb: 3 }}>
                Customer selected "Pay at Salon". Choose payment method to complete the payment:
              </Alert>
            )}

            {isPolling && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Checking payment status... (Attempt {pollAttempts + 1}/5)</Typography>
                </Box>
              </Alert>
            )}

            {isPaid && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Payment already completed. Confirm to complete the work and mark order as delivered:
              </Alert>
            )}

            {!paymentMethod && isPostPaid && !isPolling && (
              <Box sx={classes.paymentMethodBox}>
                <Card sx={classes.paymentCard} onClick={handleUPIPayment}>
                  <CardContent sx={classes.paymentCardContent}>
                    <QrCode size={48} style={{ marginBottom: 16, color: "#1976d2" }} />
                    <Typography variant="h6" gutterBottom>
                      Razorpay Payment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pay using UPI, Cards, Netbanking via Razorpay
                    </Typography>
                  </CardContent>
                </Card>

                <Card sx={classes.paymentCard} onClick={handleCashPayment}>
                  <CardContent sx={classes.paymentCardContent}>
                    <CreditCard size={48} style={{ marginBottom: 16, color: "#2e7d32" }} />
                    <Typography variant="h6" gutterBottom>
                      Cash Payment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customer pays in cash - confirm receipt
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {!paymentMethod && isPaid && (
              <Box sx={{ textAlign: "center", mb: 3 }}>
                <Card sx={classes.paymentCard} onClick={() => onPaymentComplete(PaymentMethodTypes.Complete)}>
                  <CardContent sx={classes.paymentCardContent}>
                    <CheckCircle size={48} style={{ marginBottom: 16, color: "#2e7d32" }} />
                    <Typography variant="h6" gutterBottom>
                      Complete Work
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Payment received. Click to mark order as delivered.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {paymentMethod === "cash" && (
              <Box sx={classes.completeWorkBox}>
                <Typography variant="h6" gutterBottom>
                  <CreditCard style={{ verticalAlign: "middle", marginRight: 8 }} />
                  Cash Payment Confirmation
                </Typography>

                <Card variant="outlined" sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h4" color="primary" gutterBottom>
                    ₹{order?.total_amount}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Please confirm that you have received this amount in cash from the customer.
                  </Typography>
                </Card>

                <Alert severity="warning">
                  Once confirmed, this order will be marked as paid and cannot be undone.
                </Alert>
              </Box>
            )}
          </>
        }
        actions={
          <>
            <BBButton onClick={handleClose} variant="outlined">
              Cancel
            </BBButton>

            {paymentMethod == PaymentMethodTypes.Cash && (
              <BBButton
                onClick={confirmPayment}
                variant="contained"
                color="success"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle size={20} />}
              >
                {loading ? "Processing..." : "Confirm Cash Payment"}
              </BBButton>
            )}
          </>
        }
      />
    </>
  );
};

export default PaymentDialog;
