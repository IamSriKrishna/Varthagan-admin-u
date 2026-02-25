"use client";
import { OrdersTable } from "@/components/orders/OrderTable";
import { PartnerSelectionDialog } from "@/components/PartnerDialogs/PartnerDialogs";
import PaymentDialog from "@/components/Payment/PaymentDialog";
import { config } from "@/config";
import { orders, partners, payments, vendors } from "@/constants/apiConstants";
import { OrderStatus, orderStatusOptions } from "@/constants/ordersConstans";
import { PaymentMethodTypes, PaymentStatus, paymentStatusOptions } from "@/constants/payment";
import { useOrderPolling } from "@/hooks/services/useIdealData";
import useApi from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTitle } from "@/lib";
import { IOrderList, OrderApiResponse } from "@/models/IOrders";
import { IPartnersResponse } from "@/models/IPartners";
import { RootState } from "@/store";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import { Filter } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as classes from "../../../styles/listtable.styles";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
interface CancelOrderResponse {
  success: boolean;
  message: string;
  data?: {
    payment_status?: string;
  };
}

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [openRefunded, setOpenRefund] = useState(false);
  const [filteropen, setFilterOpen] = useState<boolean>(true);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrderList | null>(null);
  const [filters, setFilters] = useState({ search: "", payment_status: "", order_status: "" });
  const [paymentPolling, setPaymentPolling] = useState<Set<string>>(new Set());
  const toCancelRef = useRef<{ customer_id: string; order_id: string } | null>(null);
  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const debouncedSearch = useDebounce(filters.search, 500);
  const userType = useSelector((state: RootState) => state.auth.user?.user_type || "");
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedVendorId && userType == "superadmin") {
      params.append("vendor_id", String(selectedVendorId));
    }

    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    if (filters.search && debouncedSearch) {
      params.append("search", debouncedSearch);
    }

    if (filters.payment_status && filters.payment_status.trim()) {
      params.append("payment_status", filters.payment_status);
    }

    if (filters.order_status && filters.order_status.trim()) {
      params.append("order_status", filters.order_status);
    }

    return params.toString();
  }, [selectedVendorId, page, rowsPerPage, filters, debouncedSearch, userType]);

  const {
    data: results,
    refetch,
    loading,
  } = useFetch<OrderApiResponse<IOrderList[]>>({
    url:
      userType == "admin"
        ? `${vendors.getVendorOrder(String(selectedVendorId ?? ""))}?${queryParams}`
        : `${orders.getOrders}?${queryParams}`,
    baseUrl: config.orderDomain,
  });
  const partnersQueryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedVendorId) {
      params.append("vendor_id", String(selectedVendorId));
    }
    params.append("limit", "100");
    return params.toString();
  }, [selectedVendorId]);

  const { data: partnersData, loading: partnersLoading } = useFetch<IPartnersResponse>({
    url: `${partners.getPartners}${partnersQueryParams ? `?${partnersQueryParams}` : ""}`,
    baseUrl: config.partnerDomain,
    options: {
      skip: !partnerDialogOpen,
    },
  });
  const availablePartners = partnersData?.data?.partners || [];
  useOrderPolling({ refetch, selectedVendorId: selectedVendorId ?? undefined, isEnabled: results?.success });

  useEffect(() => {
    if (selectedOrder && results?.data?.orders) {
      const updatedOrder = results.data.orders.find((order) => order.id === selectedOrder.id);
      if (updatedOrder && updatedOrder.payment_status !== selectedOrder.payment_status) {
        // console.log(
        //   `Updating selectedOrder payment status from ${selectedOrder.payment_status} to ${updatedOrder.payment_status}`,
        // );
        setSelectedOrder(updatedOrder);
      }
    }
  }, [results?.data?.orders, selectedOrder]);

  const { mutateApi: cancelOrder } = useApi<CancelOrderResponse>("", "PUT", undefined, config.orderDomain);
  const { mutateApi: assignPartner, loading: assigningPartner } = useApi<ApiResponse<null>>(
    "",
    "PUT",
    undefined,
    config.orderDomain,
  );
  const { mutateApi: endWork } = useApi<ApiResponse<null>>("", "PUT", undefined, config.orderDomain);
  useEffect(() => {
    if (paymentPolling.size === 0) return;

    const pollPayments = async () => {
      for (const orderId of paymentPolling) {
        try {
          const response = await appFetch(`${config.orderDomain}${payments.pollPayments(orderId)}`, { method: "GET" });
          const data = await response.json();
          const normalizedStatus = (data.payment_status || "").toLowerCase();
          if (
            normalizedStatus === PaymentStatus.CAPTURED ||
            // normalizedStatus === PaymentStatus.PAID ||
            normalizedStatus === PaymentStatus.SUCCESS
          ) {
            setPaymentPolling((prev) => {
              const newSet = new Set(prev);
              newSet.delete(orderId);
              return newSet;
            });

            // Also complete the work after successful UPI payment
            try {
              const workResponse = await endWork(
                {
                  completed_at: new Date().toISOString(),
                  order_status: OrderStatus.DELIVERED, // Use "delivered" instead of "fulfilled"
                },
                orders.updateOrder(orderId),
              );

              if (workResponse?.success) {
                showToastMessage("UPI payment confirmed and work completed successfully!", "success");
              } else {
                showToastMessage("UPI payment confirmed but work completion failed", "error");
              }
            } catch (workError) {
              console.error(`Failed to complete work for order ${orderId}:`, workError);
              showToastMessage("UPI payment confirmed but work completion failed", "error");
            }

            refetch(); // Refresh orders list
          }
        } catch (error) {
          console.error(`Failed to poll payment for order ${orderId}:`, error);
        }
      }
    };

    const interval = setInterval(pollPayments, 10000);
    return () => clearInterval(interval);
  }, [paymentPolling, refetch, endWork]);

  const handleCancelConfirm = async () => {
    if (!toCancelRef.current) return;

    const { order_id } = toCancelRef.current;
    try {
      const cancelUrl = orders.updateOrder(order_id);
      const response = await cancelOrder({ order_status: OrderStatus.CANCELLED }, cancelUrl);

      if (response?.success) {
        showToastMessage(response.message || "Order cancelled successfully", "success");
        if (response?.data?.payment_status == "captured" || response?.data?.payment_status == "success") {
          setOpenRefund(true);
        }
        refetch();
      } else {
        showToastMessage(response?.message ?? "Cancel failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    } finally {
      setOpen(false);
      toCancelRef.current = null;
    }
  };

  const handleStartWork = (order: IOrderList) => {
    setSelectedOrder(order);
    setPartnerDialogOpen(true);
  };

  const handleEndWork = (order: IOrderList) => {
    setSelectedOrder(order);
    // console.log("handleEndWork - Order payment status (payment_status field):", order.payment_status);
    // console.log("handleEndWork - Order fulfillment status (order_status field):", order.order_status);
    // console.log("handleEndWork - Full order object:", order);
    setPaymentDialogOpen(true);
  };

  // const handlePartnerAssign = async (partnerIds: string[]) => {
  //   if (!selectedOrder || !selectedOrder.items) return;

  //   const item_partners = selectedOrder.items.map((item, index) => ({
  //     item_id: item.id,
  //     partner_id: partnerIds[index],
  //   }));

  //   try {
  //     const response = await assignPartner({ item_partners }, orders.updateOrder(selectedOrder.id));

  //     if (response?.success) {
  //       showToastMessage("Partner assigned and work started successfully!", "success");
  //       refetch();
  //       setPartnerDialogOpen(false);
  //     } else {
  //       showToastMessage(response?.message ?? "Partner assignment failed", "error");
  //     }
  //   } catch (e: unknown) {
  //     const errorMessage =
  //       typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
  //     showToastMessage(errorMessage, "error");
  //   } finally {
  //     setSelectedOrder(null);
  //   }
  // };

  const handlePartnerAssign = async (partnerId: string) => {
    if (!selectedOrder) return;

    try {
      const response = await assignPartner({ partner_id: partnerId }, orders.updateOrder(selectedOrder.id));

      if (response?.success) {
        showToastMessage("Partner assigned and work started successfully!", "success");
        refetch();
      } else {
        showToastMessage(response?.message ?? "Partner assignment failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };
  const handlePaymentClick = (order: IOrderList) => {
    setSelectedOrder(order);
    setPaymentDialogOpen(true);
  };

  const handlePaymentComplete = async (paymentMethod: PaymentMethodTypes) => {
    if (!selectedOrder) return;

    try {
      if (paymentMethod == PaymentMethodTypes.Complete) {
        // For already paid orders, just complete the work
        const workResponse = await endWork(
          {
            completed_at: new Date().toISOString(),
            order_status: OrderStatus.DELIVERED,
          },
          orders.updateOrder(selectedOrder.id),
        );

        if (workResponse?.success) {
          showToastMessage("Work completed successfully!", "success");
        } else {
          showToastMessage("Work completion failed", "error");
        }
        refetch();
      } else if (paymentMethod == PaymentMethodTypes.Cash) {
        // For cash payments, use the admin cash payment endpoint
        try {
          const cashPaymentResponse = await appFetch(`${config.orderDomain}${payments.cashPayment(selectedOrder.id)}`, {
            method: "PUT",
          });

          // const cashPaymentResponse = await processCashPayment(selectedOrder.id);
          const cashPaymentData = await cashPaymentResponse.json();

          if (cashPaymentResponse.ok && cashPaymentData.message) {
            // Immediately refresh to show updated payment status
            refetch();

            // After successful payment, complete the work
            const workResponse = await endWork(
              {
                completed_at: new Date().toISOString(),
                order_status: OrderStatus.DELIVERED, // Use "delivered" instead of "fulfilled"
              },
              orders.updateOrder(selectedOrder.id),
            );

            if (workResponse?.success) {
              showToastMessage("Cash payment confirmed and work completed successfully!", "success");
            } else {
              showToastMessage("Payment confirmed but work completion failed", "error");
            }
            refetch();
          } else {
            showToastMessage(cashPaymentData?.error ?? "Cash payment confirmation failed", "error");
          }
        } catch (error) {
          console.error("Cash payment error:", error);
          showToastMessage("Cash payment confirmation failed", "error");
        }
      } else if (paymentMethod == PaymentMethodTypes.UPI) {
        // For UPI payments, start polling
        setPaymentPolling((prev) => new Set([...prev, selectedOrder.id]));
        showToastMessage("Started monitoring UPI payment. Status will update automatically.", "info");
      }

      setPaymentDialogOpen(false);
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
      <BBLoader enabled={loading} />
      <BBTitle
        title="Orders"
        rightContent={
          <BBButton variant="outlined" startIcon={<Filter size={18} />} onClick={() => setFilterOpen(!filteropen)}>
            {filteropen ? "Hide Filters" : "Show Filters"}
          </BBButton>
        }
      />
      <Box component={Paper} sx={{ borderRadius: "10px 10px 0 0", boxShadow: "none" }}>
        <Collapse in={filteropen} timeout="auto" unmountOnExit>
          <Typography variant="h6" sx={classes.FileDropStyle}>
            Filter
          </Typography>
          <Grid container spacing={2} component="div" sx={{ mb: 2, p: 2 }}>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdownBase
                name="payment_status"
                label="Payment Status"
                value={filters.payment_status}
                options={[{ value: "", label: "All" }, ...paymentStatusOptions]}
                onDropdownChange={(e, _name, val) => handleTypeChange("payment_status", val as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdownBase
                name="order_status"
                label="Order Status"
                value={filters?.order_status}
                options={[{ value: "", label: "All" }, ...orderStatusOptions]}
                onDropdownChange={(e, _name, val) => handleTypeChange("order_status", val as string)}
              />
            </Grid>
          </Grid>{" "}
          <Divider />
        </Collapse>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Box sx={{ width: { md: 300 } }}>
            <BBInputBase
              label=""
              name="search"
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search Orders"
            />
          </Box>
        </Stack>
      </Box>{" "}
      <OrdersTable
        data={results?.data?.orders ?? []}
        filters={filters}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={results?.data?.meta?.total ?? 0}
        paymentPolling={paymentPolling}
        onPageChange={setPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setPage(0);
        }}
        handlePaymentClick={handlePaymentClick}
        handleStartWork={handleStartWork}
        handleEndWork={handleEndWork}
        toCancelRef={toCancelRef}
        setOpen={setOpen}
        action={true}
      />
      <BBDialog
        open={openRefunded}
        maxWidth="md"
        onClose={() => setOpenRefund(false)}
        title="Refund Order"
        content="Please refund in cash."
        onConfirm={() => setOpenRefund(false)}
        confirmText="OK"
        confirmColor="error"
        HideCancelButton={true}
      />
      <BBDialog
        open={open}
        maxWidth="md"
        onClose={() => setOpen(false)}
        title="Cancel Order"
        content="Are you sure you want to cancel this order? This will set the order status to cancelled and cannot be undone."
        onConfirm={handleCancelConfirm}
        confirmText="Cancel Order"
        cancelText="Keep Order"
        confirmColor="error"
      />
      <PartnerSelectionDialog
        open={partnerDialogOpen}
        onClose={() => setPartnerDialogOpen(false)}
        onConfirm={handlePartnerAssign}
        partners={availablePartners}
        loading={assigningPartner || partnersLoading}
        orderInfo={{
          id: selectedOrder?.id || "",
          customer_name: selectedOrder?.customer_name,
          product_name: selectedOrder?.product_name,
          payment_status: selectedOrder?.payment_status,
          // items: selectedOrder?.items ?? [],
        }}
      />
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        order={selectedOrder}
        onPaymentComplete={handlePaymentComplete}
        loading={false}
      />
    </Box>
  );
}
