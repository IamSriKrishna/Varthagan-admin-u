"use client";

import logo from "@/assets/images/mainlogo.jpg";
import { config } from "@/config";
import { orders } from "@/constants/apiConstants";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBLoader, BBTitle } from "@/lib";
import BBPrint from "@/lib/BBPrint/BBPrint";
import { IOrderList } from "@/models/IOrders";
import { RootState } from "@/store";
import { Box, Card, Divider, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";
import { useSelector } from "react-redux";
import * as classes from "./Order.styles";
import AmountInWords from "@/components/AmountInWords/AmountInWords";
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const OrderInvoice = () => {
  const router = useRouter();
  const params = useParams();
  const componentRef = useRef<HTMLDivElement>(null);
  const orderId = Array.isArray(params?.orderId) ? params.orderId[0] : params?.orderId;
  const { loading: authLoading } = useSelector((state: RootState) => state.auth);

  const { data: rawOrderData, loading: orderLoading } = useFetch<ApiResponse<IOrderList>>({
    url: orders.getOrderById(orderId),
    baseUrl: config.orderDomain,
  });
  const orderData = rawOrderData?.data as IOrderList;

  if (!orderData && !orderLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
      </Box>
    );
  }
  const handleBack = () => router.push("/orders");

  return (
    <Box>
      <BBLoader enabled={orderLoading || authLoading} />
      <Box mb={3} sx={classes.noPrintBox}>
        <BBTitle
          title="Order Details"
          subtitle="Complete order information and invoice"
          rightContent={
            <Box display="flex" gap={1}>
              <BBButton variant="outlined" onClick={handleBack} startIcon={<ArrowLeft size={20} />}>
                Back to Orders
              </BBButton>

              <BBPrint componentRef={componentRef} documentTitle="Order Report" printSize="80mm">
                Print Report
              </BBPrint>
            </Box>
          }
        />
      </Box>

      <Card elevation={1} sx={{ borderRadius: 2, p: 2, maxWidth: "80mm", margin: "0 auto" }} ref={componentRef}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
            <Image src={logo} alt="Logo" width={50} height={50} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "20px" }}>
            {orderData?.vendor_legal_name || "" || orderData?.vendor_name || "Xpressions"}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "14px" }}>
            Service Order Invoice
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "12px", mt: 0.5 }}>
            {orderData?.vendor_city}, {orderData?.vendor_state} - Phone: {orderData?.vendor_phone}
          </Typography>
          <Divider sx={{ my: 1, borderWidth: "2px", borderColor: "#000" }} />

          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <QRCodeCanvas value={`ORDER-${orderData?.id}`} size={120} level="M" includeMargin={true} />
          </Box>
          <Typography sx={{ fontSize: "12px", mb: 1 }}>Scan for Order Details</Typography>

          <Divider sx={{ my: 1, borderWidth: "2px", borderColor: "#000" }} />
        </Box>

        {/* Order Info */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "15px", mb: 0.5 }}>
            Order ID: <strong>#{orderData?.id.toUpperCase()}</strong>
          </Typography>
          <Typography sx={{ fontSize: "13px" }}>
            Date:
            {orderData?.created_at ? dayjs(orderData?.created_at).format("MMM D, YYYY h:mm A") : "-"}
          </Typography>
          <Typography sx={{ fontSize: "13px", mt: 0.5 }}>
            Status: <strong>{orderData?.order_status?.toUpperCase?.()}</strong>
          </Typography>
          <Typography sx={{ fontSize: "13px" }}>
            Payment: <strong>{orderData?.payment_status?.toUpperCase?.()}</strong>
          </Typography>
          <Divider sx={{ my: 1 }} />
        </Box>

        {/* Customer Details */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "15px", mb: 1 }}>CUSTOMER</Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>{orderData?.customer_name}</Typography>
          {orderData?.customer_phone && (
            <Typography sx={{ fontSize: "13px" }}>Phone: {orderData?.customer_phone}</Typography>
          )}
          {orderData?.customer_email && (
            <Typography sx={{ fontSize: "13px" }}>Email: {orderData?.customer_email}</Typography>
          )}
          {orderData?.delivery_address && (
            <Typography sx={{ fontSize: "13px" }}>Address: {orderData?.delivery_address}</Typography>
          )}
          {orderData?.delivery_landmark && (
            <Typography sx={{ fontSize: "13px" }}>Landmark: {orderData?.delivery_landmark}</Typography>
          )}
          {orderData?.delivery_address_type && (
            <Typography sx={{ fontSize: "13px" }}>Address Type: {orderData?.delivery_address_type}</Typography>
          )}
          {orderData?.delivery_google_maps_link && (
            <Typography sx={{ fontSize: "13px" }}>
              <a
                href={orderData?.delivery_google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1976d2", textDecoration: "none" }}
              >
                View on Google Maps
              </a>
            </Typography>
          )}
          <Divider sx={{ my: 1 }} />
        </Box>

        {/* Services Table */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "15px", mb: 1 }}>SERVICES</Typography>
          <Table sx={{ width: "100%", border: "1px solid #000" }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    p: "4px",
                    border: "1px solid #000",
                    backgroundColor: "#000",
                    color: "#fff",
                  }}
                >
                  Item
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontWeight: 700,
                    fontSize: "14px",
                    p: "4px",
                    border: "1px solid #000",
                    backgroundColor: "#000",
                    color: "#fff",
                  }}
                >
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orderData?.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: "13px", p: "4px", border: "1px solid #000" }}>
                    <strong>{item?.product_name}</strong>
                    <br />
                    <span style={{ fontSize: "12px" }}>
                      Qty: {item?.quantity} × ₹{item?.unit_price.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: "14px", fontWeight: 600, p: "4px", border: "1px solid #000" }}
                  >
                    ₹{item?.total_price.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Payment Summary */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1, borderWidth: "2px", borderColor: "#000" }} />
          <Typography sx={{ fontWeight: 700, fontSize: "15px", mb: 1 }}>PAYMENT SUMMARY</Typography>

          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: "13px" }}>Subtotal:</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                ₹{orderData?.subtotal_amount.toFixed(2)}
              </Typography>
            </Stack>

            {orderData?.bb_coins_discount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: "13px" }}>BB Coins Used:</Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                  -₹{orderData?.bb_coins_discount.toFixed(2)}
                </Typography>
              </Stack>
            )}

            {orderData?.membership_discount_amount > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography sx={{ fontSize: "13px" }}>Membership Discount:</Typography>
                <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                  -₹{orderData?.membership_discount_amount.toFixed(2)}
                </Typography>
              </Stack>
            )}

            {/* Taxable Amount */}
            <Divider sx={{ my: 0.5 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: "13px" }}>Taxable Amount:</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                ₹
                {(
                  orderData?.subtotal_amount -
                  (orderData?.bb_coins_discount || 0) -
                  (orderData?.membership_discount_amount || 0)
                ).toFixed(2)}
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: "13px" }}>GST:</Typography>
              <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>+₹{(orderData?.gst || 0).toFixed(2)}</Typography>
            </Stack>

            <Divider sx={{ my: 0.5, borderWidth: "1px" }} />

            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>TOTAL:</Typography>
              <Typography sx={{ fontSize: "16px", fontWeight: 700 }}>₹{orderData?.total_amount}</Typography>
            </Stack>

            <Box sx={{ mt: 1, p: 1, backgroundColor: "#f5f5f5", border: "1px solid #000" }}>
              <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>Amount in Words:</Typography>
              {orderData?.total_amount > 0 && (
                <Typography sx={{ fontSize: "12px" }}>
                  {" "}
                  <AmountInWords amount={orderData.total_amount} />
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 1, borderWidth: "2px", borderColor: "#000" }} />

          <Typography sx={{ fontSize: "13px", mt: 1 }}>
            Payment Method: <strong>{orderData?.payment_method || "N/A"}</strong>
          </Typography>
          <Typography sx={{ fontSize: "13px" }}>
            Payment Status: <strong>{orderData?.payment_status?.toUpperCase?.()}</strong>
          </Typography>

          <Box sx={{ mt: 2, p: 1, border: "1px dashed #000", textAlign: "center" }}>
            <Typography sx={{ fontSize: "11px", fontStyle: "italic" }}>
              This is a computer-generated digital invoice.
            </Typography>
            <Typography sx={{ fontSize: "11px", fontStyle: "italic" }}>No signature required.</Typography>
          </Box>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 700 }}>Thank You!</Typography>
            <Typography sx={{ fontSize: "12px" }}>Visit Again</Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default OrderInvoice;
