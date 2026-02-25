"use client";

import { OrderStatus } from "@/constants/ordersConstans";
import { PaymentStatus, PaymentType } from "@/constants/payment";
import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { IOrderList } from "@/models/IOrders";
import { getOrderStatusColor } from "@/utils/orderStyles";
import { getPaymentStatusColor } from "@/utils/paymentStyles";
import { Box, Chip, IconButton, Typography } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { CreditCard, Download, Play, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { Dispatch, RefObject, SetStateAction } from "react";

interface OrdersTableProps {
  data: IOrderList[];
  filters?: { search: string };
  paymentPolling?: Set<string>;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  handlePaymentClick?: (row: IOrderList) => void;
  handleStartWork?: (row: IOrderList) => void;
  handleEndWork?: (row: IOrderList) => void;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  toCancelRef?: RefObject<{ customer_id: string; order_id: string } | null>;
  action: boolean;
  partner?: boolean;
  customer?: boolean;
}
dayjs.extend(utc);

export const OrdersTable: React.FC<OrdersTableProps> = ({
  data,
  filters,
  paymentPolling,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  handlePaymentClick,
  handleStartWork,
  handleEndWork,
  setOpen,
  toCancelRef,
  action,
  partner = true,
  customer = true,
}) => {
  const router = useRouter();
  const [expandedRows, setExpandedRows] = React.useState<Record<string, boolean>>({});
  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };
  const columns: ITableColumn<IOrderList>[] = [
    {
      key: "id",
      label: "Order ID",
      render: (row) => (
        <Box sx={{ fontFamily: "monospace", fontSize: "0.875rem", cursor: "pointer" }} title={row.id}>
          {row.id.substring(0, 8)}...
        </Box>
      ),
    },

    ...(customer
      ? [
          {
            key: "customer_name" as keyof IOrderList,
            label: "Customer",
            render: (row: IOrderList) => (
              <Typography
                component="span"
                sx={{
                  cursor: "pointer",
                  color: "#1976d2",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    color: "#1565c0",
                    textDecoration: "underline",
                  },
                }}
                onClick={() => router.push(`/customers/customer/${row.customer_id}/view`)}
              >
                <HighlightedCell value={row.customer_name || "Unknown Customer"} search={filters?.search ?? ""} />
              </Typography>
            ),
            cellStyle: { minWidth: 150, maxWidth: 200 },
          },
        ]
      : []),

    {
      key: "product_name",
      label: "Product",
      render: (row) => {
        if (!row.items || row.items.length === 0) {
          return <span>Unknown Product</span>;
        }

        const MAX_VISIBLE = 3;
        const isExpanded = !!expandedRows[row.id];
        const visibleItems = isExpanded ? row.items : row.items.slice(0, MAX_VISIBLE);

        return (
          <Box>
            {visibleItems.map((item) => (
              <Box key={item.id}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.product_name}
                >
                  <HighlightedCell value={item.product_name} search={filters?.search ?? ""} />
                </Typography>

                {/* {partner && item?.partner_name != "" && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: item.partner_name?.trim() ? "#1976d2" : "#d32f2f",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={item.partner_name?.trim() || "Not Assigned"}
                  >
                    Partner:{" "}
                    <HighlightedCell
                      value={item.partner_name?.trim() || "Not Assigned"}
                      search={filters?.search ?? ""}
                    />
                  </Typography>
                )} */}
              </Box>
            ))}

            {row.items.length > MAX_VISIBLE && (
              <Typography
                component="button"
                onClick={() => toggleRow(row.id)}
                sx={{
                  mt: 0.5,
                  background: "none",
                  border: "none",
                  color: "primary.main",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  p: 0,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {isExpanded ? "Show less" : `+${row.items.length - MAX_VISIBLE} more`}
              </Typography>
            )}
          </Box>
        );
      },
      cellStyle: {
        minWidth: 160,
        maxWidth: 200,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },
    ...(partner
      ? [
          {
            key: "partner_name" as keyof IOrderList,
            label: "Partner",
            render: (row: IOrderList) => (
              <HighlightedCell value={row.partner_name || "Not Assigned"} search={filters?.search ?? ""} />
            ),
          },
        ]
      : []),

    {
      key: "payment_status",
      label: "Payment Status",
      render: (row) => {
        const isPolling = paymentPolling?.has(row.id);
        const isPostPaid = row.payment_type === PaymentType.POST_PAID;
        const paymentStatus = (row.payment_status || PaymentStatus.PENDING).toLowerCase();

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              label={
                <HighlightedCell
                  value={isPolling ? "Monitoring..." : paymentStatus.toUpperCase()}
                  search={filters?.search ?? ""}
                />
              }
              color={getPaymentStatusColor(paymentStatus)}
              size="small"
              sx={{ fontWeight: 500, fontSize: "0.75rem", height: 24 }}
            />
            {isPostPaid && paymentStatus === PaymentStatus.PENDING && handlePaymentClick && (
              <IconButton size="small" color="primary" onClick={() => handlePaymentClick(row)} title="Complete payment">
                <CreditCard size={16} />
              </IconButton>
            )}
          </Box>
        );
      },
    },
    {
      key: "order_status",
      label: "Order Status",
      render: (row) => (
        <Chip
          label={<HighlightedCell value={row.order_status?.toUpperCase()} search={filters?.search ?? ""} />}
          color={getOrderStatusColor(row.order_status)}
          size="small"
          sx={{ fontWeight: 500, fontSize: "0.75rem", textTransform: "capitalize" }}
        />
      ),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (row) => <HighlightedCell value={`₹${row.total_amount}`} search={filters?.search ?? ""} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (row) => (
        <Box sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          {row.created_at ? dayjs.utc(row.created_at).format("MMM D, YYYY h:mm A") : "-"}
        </Box>
      ),
    },
  ];

  if (action) {
    columns.push({
      key: "action",
      label: "Action",
      render: (row) => {
        const isPartnerAssigned = row.partner_id != null;

        const isDelivered = row.order_status === OrderStatus.DELIVERED;
        const isCancelled = row.order_status === OrderStatus.CANCELLED;
        const isProcessing = row.order_status === OrderStatus.PROCESSING;
        const isPending = row.order_status === OrderStatus.PENDING;

        // const isPaymentDone =
        //   row.payment_status === PaymentStatus.SUCCESS || row.payment_status === PaymentStatus.CAPTURED;

        return (
          <>
            <IconButton size="small" color="primary" onClick={() => router.push(`/orders/order/${row.id}`)}>
              <Download size={16} />
            </IconButton>

            {handleStartWork && (
              <IconButton
                size="small"
                color="success"
                disabled={isPartnerAssigned || !isPending}
                onClick={() => handleStartWork(row)}
                title={isPartnerAssigned ? "Partner already assigned" : "Assign partner and start work"}
              >
                <Play size={16} />
              </IconButton>
            )}

            {handleEndWork && (
              <IconButton
                size="small"
                color="warning"
                disabled={!isPartnerAssigned || isDelivered || isCancelled}
                onClick={() => handleEndWork(row)}
                title={isDelivered ? "Work already completed" : isCancelled ? "Order cancelled" : "End work"}
              >
                <Square size={16} />
              </IconButton>
            )}

            <IconButton
              size="small"
              color="error"
              disabled={isDelivered || isCancelled}
              onClick={() => {
                if (toCancelRef && setOpen) {
                  toCancelRef.current = {
                    customer_id: row.customer_id,
                    order_id: row.id,
                  };
                  setOpen(true);
                }
              }}
              title={
                isCancelled
                  ? "Order already cancelled"
                  : isDelivered
                    ? "Cannot cancel delivered order"
                    : isProcessing
                      ? "Cancel order"
                      : "Cannot cancel order"
              }
            >
              <X size={16} />
            </IconButton>
          </>
        );
      },
      cellStyle: { minWidth: 160, maxWidth: 200 },
    });
  }

  return (
    <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <BBTable
        data={data}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        renderAccordionContent={(row) => {
          return (
            <Box
              sx={{
                p: 2,
                bgcolor: "#f9f9f9",
                borderLeft: "3px solid #1976d2",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                Order ID: {row.id}
              </Typography>

              <Box sx={{ mb: 2, p: 1, bgcolor: "#fff", borderRadius: 1, border: "1px solid #e0e0e0" }}>
                <Typography variant="subtitle2" fontWeight={600} color="primary" sx={{ mb: 1 }}>
                  Delivery Details
                </Typography>
                <Typography variant="body2">
                  <strong>Customer:</strong> {row.customer_name}
                </Typography>
                {row.delivery_address && (
                  <Typography variant="body2">
                    <strong>Address:</strong> {row.delivery_address}
                  </Typography>
                )}
                {row.delivery_phone_number && (
                  <Typography variant="body2">
                    <strong>Phone:</strong> {row.delivery_phone_number}
                  </Typography>
                )}
                {row.delivery_landmark && (
                  <Typography variant="body2">
                    <strong>Landmark:</strong> {row.delivery_landmark}
                  </Typography>
                )}
                {row.delivery_address_type && (
                  <Typography variant="body2">
                    <strong>Address Type:</strong> {row.delivery_address_type}
                  </Typography>
                )}
                {row.delivery_google_maps_link && (
                  <Typography variant="body2">
                    <strong>Map:</strong>{" "}
                    <Box
                      component="a"
                      href={row.delivery_google_maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: "#1976d2", textDecoration: "underline" }}
                    >
                      View on Google Maps
                    </Box>
                  </Typography>
                )}
              </Box>
              {/* )} */}

              {row.items?.map((item) => {
                const isPercentage = item?.membership_discount_type == "percentage";
                const membershipDiscount = isPercentage ? `${item.membership_discount_amount}%` : "Fixed";

                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                    }}
                  >
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1" fontWeight={500} color="textPrimary">
                          {item.product_name}
                        </Typography>

                        <Typography variant="body2" fontWeight={400} color="primary">
                          GST: {item.gst_percentage}%
                        </Typography>
                      </Box>
                      {/* {partner && item?.partner_name && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#1976d2",
                          }}
                        >
                          Partner: {item.partner_name.trim() || "Not Assigned"}
                        </Typography>
                      )} */}

                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity} × ₹{item.unit_price}
                      </Typography>

                      {item.membership_discount_amount > 0 && (
                        <Typography variant="body2" color="success.main">
                          Membership Discount: {membershipDiscount}
                        </Typography>
                      )}

                      {item.bb_coins_used > 0 && (
                        <Typography variant="body2" sx={{ color: "#FFD700" }}>
                          Coin:🪙 {item.bb_coins_used}
                        </Typography>
                      )}
                    </Box>

                    <Typography variant="body1" fontWeight={600} color="#1976d2">
                      ₹{item.total_price}
                    </Typography>
                  </Box>
                );
              })}

              <Box sx={{ mt: 2, pt: 1.5, borderTop: "2px dashed #ddd" }}>
                {/* Subtotal */}
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="subtitle2">₹{row.subtotal_amount}</Typography>
                </Box>
                {row.bb_coins_discount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Coins Used 🪙
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#FFD700" }}>
                      -₹{row.bb_coins_discount}
                    </Typography>
                  </Box>
                )}
                {row.membership_discount_amount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Membership Discount
                    </Typography>
                    <Typography variant="subtitle2" color="success.main">
                      -₹{row.membership_discount_amount}
                    </Typography>
                  </Box>
                )}

                {row.gst > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      GST
                    </Typography>
                    <Typography variant="subtitle2">₹{Math.round(row.gst)}</Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1.5,
                    pt: 1,
                    borderTop: "1px dashed #ccc",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    Final Price
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="success.main">
                    ₹{row.final_amount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        }}
      />
    </Box>
  );
};
