"use client";

import React from "react";
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import { IInvoice } from "@/models/IInvoice";
import dayjs from "dayjs";

interface InvoiceDetailViewProps {
  invoice: IInvoice;
  companyName?: string;
  companyAddress?: string;
}

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoice,
  companyName = "Your Company",
  companyAddress = "Address, City, State",
}) => {
  const subTotal = invoice.line_items?.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  ) || 0;
  const shippingCharges = invoice.shipping_charges || 0;
  const taxAmount = invoice.tax_amount || 0;
  const adjustment = invoice.adjustment || 0;
  const total = invoice.total || 0;

  const balanceDue = invoice.status === "paid" ? 0 : total - (invoice.payment_received ? total : 0);

  return (
    <Box sx={{ bgcolor: "#fff", p: 0 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 0,
          border: "1px solid #ddd",
          bgcolor: "#fff",
        }}
      >
        {/* Header Section with Logo/Company Name */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Box
              sx={{
                width: 60,
                height: 60,
                bgcolor: "#f0f0f0",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "#999" }}>
                LOGO
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              {companyName}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {companyAddress}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontSize: "28px",
                mb: 1,
              }}
            >
              TAX INVOICE
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Invoice Metadata */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Grid container spacing={1}>
              <Grid size={5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  #
                </Typography>
              </Grid>
              <Grid size={7}>
                <Typography variant="body2">{invoice.invoice_number}</Typography>
              </Grid>

              <Grid size={5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Invoice Date
                </Typography>
              </Grid>
              <Grid size={7}>
                <Typography variant="body2">
                  {dayjs(invoice.invoice_date).format("DD/MM/YYYY")}
                </Typography>
              </Grid>

              <Grid size={5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Terms
                </Typography>
              </Grid>
              <Grid size={7}>
                <Typography variant="body2">
                  {invoice.terms?.replace("_", " ") || "Due on Receipt"}
                </Typography>
              </Grid>

              <Grid size={5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Due Date
                </Typography>
              </Grid>
              <Grid size={7}>
                <Typography variant="body2">
                  {dayjs(invoice.due_date).format("DD/MM/YYYY")}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Bill To and Ship To */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "#666" }}
            >
              Bill To
            </Typography>
            <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {invoice.customer?.display_name || "Customer Name"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                {invoice.customer?.email || ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {invoice.customer?.phone || ""}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, mb: 1, color: "#666" }}
            >
              Ship To
            </Typography>
            <Box sx={{ bgcolor: "#f9f9f9", p: 2, borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {invoice.customer?.display_name || "Customer Name"}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                {invoice.customer?.email || ""}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {invoice.customer?.phone || ""}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* Line Items Table */}
        <Box sx={{ mb: 3, overflowX: "auto" }}>
          <Table
            sx={{
              minWidth: 700,
              "& .MuiTableCell-root": {
                borderColor: "#e0e0e0",
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 1.5 }}>
                  Item & Description
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>
                  Rate
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, py: 1.5 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.line_items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ py: 1.5 }}>{index + 1}</TableCell>
                  <TableCell sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.item?.name || "Item"}
                    </Typography>
                    {item.description && (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block" }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Typography variant="body2">{item.quantity}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Typography variant="body2">
                      ₹{item.rate?.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{item.amount?.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Totals Section */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {invoice.customer_notes && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1, color: "#666" }}
                >
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {invoice.customer_notes}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack spacing={1}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">Sub Total</Typography>
                <Typography variant="body2">₹{subTotal.toFixed(2)}</Typography>
              </Box>

              {shippingCharges > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">
                    ₹{shippingCharges.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  {invoice.tax?.name || `Tax (${invoice.tax?.rate}%)`}
                </Typography>
                <Typography variant="body2">₹{taxAmount.toFixed(2)}</Typography>
              </Box>

              {adjustment !== 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Adjustment</Typography>
                  <Typography variant="body2">
                    {adjustment > 0 ? "+" : ""}₹{adjustment.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1976d2" }}
                >
                  ₹{total.toFixed(2)}
                </Typography>
              </Box>

              {invoice.payment_received && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    bgcolor: "#e8f5e9",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Payment Made
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "success.main" }}
                  >
                    ({invoice.payment_received ? "₹" + total.toFixed(2) : "₹0.00"})
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  bgcolor:
                    balanceDue > 0 ? "#fff3e0" : "#e8f5e9",
                  p: 1.5,
                  borderRadius: 1,
                  border: "2px solid " + (balanceDue > 0 ? "#ffb74d" : "#81c784"),
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Balance Due
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: balanceDue > 0 ? "#f57c00" : "success.main",
                  }}
                >
                  ₹{balanceDue.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {invoice.terms_and_conditions && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, mb: 1, color: "#666" }}
              >
                Terms & Conditions
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {invoice.terms_and_conditions}
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
