"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Grid,
} from "@mui/material";
import { IInvoice } from "@/models/IInvoice";
import dayjs from "dayjs";

interface InvoiceDetailViewProps {
  invoice: IInvoice;
  companyName?: string;
  companyAddress?: string;
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    bgcolor: "#f8f9fc",
    p: 3,
  },
  paper: {
    borderRadius: "16px",
    border: "1px solid #e8eaf0",
    bgcolor: "#ffffff",
    boxShadow: "0 4px 32px rgba(79, 99, 210, 0.07), 0 1px 4px rgba(0,0,0,0.04)",
    overflow: "hidden",
  },
  // Top accent bar
  accentBar: {
    height: "4px",
    background: "linear-gradient(90deg, #4f63d2 0%, #7c3aed 100%)",
  },
  // Header
  headerSection: {
    p: "32px 36px 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "linear-gradient(135deg, #fafbff 0%, #f3f4fc 100%)",
    borderBottom: "1px solid #ecedf5",
  },
  logoBox: {
    width: 52,
    height: 52,
    borderRadius: "12px",
    background: "linear-gradient(135deg, #4f63d2, #7c3aed)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 1.5,
    boxShadow: "0 4px 12px rgba(79, 99, 210, 0.3)",
  },
  companyName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "17px",
    color: "#1a1d2e",
    letterSpacing: "-0.3px",
    lineHeight: 1.3,
  },
  companyAddress: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: "#8b90a7",
    mt: 0.5,
    lineHeight: 1.5,
  },
  invoiceTitle: {
    textAlign: "right",
  },
  invoiceTitleText: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: "26px",
    letterSpacing: "3px",
    color: "#1a1d2e",
    textTransform: "uppercase" as const,
  },
  invoiceNumberBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    color: "#4f63d2",
    bgcolor: "#eef0fb",
    border: "1px solid #d4d9f7",
    borderRadius: "6px",
    px: 1.5,
    py: 0.5,
    display: "inline-block",
    fontWeight: 600,
    mt: 1,
  },
  // Meta section
  metaSection: {
    px: "36px",
    py: "24px",
    borderBottom: "1px solid #ecedf5",
    bgcolor: "#fcfcff",
  },
  metaLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    color: "#9196b0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 0.5,
  },
  metaValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    fontWeight: 500,
    color: "#2d3058",
  },
  metaDivider: {
    width: "1px",
    bgcolor: "#e8eaf0",
    mx: 3,
    alignSelf: "stretch",
    my: 0.5,
  },
  // Address cards
  addressSection: {
    px: "36px",
    py: "24px",
    borderBottom: "1px solid #ecedf5",
  },
  addressCard: {
    bgcolor: "#f8f9fc",
    border: "1px solid #e8eaf0",
    borderRadius: "10px",
    p: "16px 18px",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  addressCardAccent: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "3px",
    height: "100%",
    background: "linear-gradient(180deg, #4f63d2, #7c3aed)",
    borderRadius: "3px 0 0 3px",
  },
  addressLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#7c3aed",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    mb: 1.5,
  },
  addressName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "14px",
    color: "#1a1d2e",
    mb: 0.5,
  },
  addressDetail: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: "#8b90a7",
    lineHeight: 1.6,
  },
  // Table
  tableSection: {
    px: "36px",
    pb: "0",
    borderBottom: "1px solid #ecedf5",
  },
  tableHeadRow: {
    bgcolor: "#f0f1f9",
  },
  tableHeadCell: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "11px",
    color: "#6b70a3",
    textTransform: "uppercase" as const,
    letterSpacing: "0.7px",
    py: "12px",
    borderBottom: "1px solid #dde0f0",
  },
  tableBodyRow: {
    "&:hover": {
      bgcolor: "#fafbff",
    },
    "&:last-child td": {
      borderBottom: "none",
    },
    transition: "background 0.15s",
  },
  tableBodyCell: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#2d3058",
    py: "14px",
    borderColor: "#ecedf5",
  },
  itemIndex: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11.5px",
    color: "#9196b0",
    fontWeight: 600,
  },
  itemName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: "13.5px",
    color: "#1a1d2e",
  },
  itemDescription: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11.5px",
    color: "#9196b0",
    mt: 0.25,
    display: "block",
  },
  qtyRate: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    color: "#4b5180",
  },
  amount: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13.5px",
    fontWeight: 700,
    color: "#1a1d2e",
  },
  // Totals section
  totalsSection: {
    px: "36px",
    py: "28px",
    display: "flex",
    gap: "32px",
    alignItems: "flex-start",
  },
  notesBox: {
    flex: 1,
  },
  notesLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#9196b0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 1,
  },
  notesText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#6b6f8a",
    lineHeight: 1.7,
    maxWidth: "360px",
  },
  totalsBox: {
    minWidth: "280px",
    bgcolor: "#f8f9fc",
    border: "1px solid #e8eaf0",
    borderRadius: "12px",
    p: "20px 24px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    py: "5px",
  },
  totalLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#6b70a3",
  },
  totalValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    color: "#2d3058",
    fontWeight: 500,
  },
  totalDivider: {
    height: "1px",
    bgcolor: "#e0e2ee",
    my: "10px",
  },
  grandTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    mt: 1,
    mb: 1,
  },
  grandTotalLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    color: "#1a1d2e",
  },
  grandTotalValue: {
    fontFamily: "'DM Mono', monospace",
    fontWeight: 700,
    fontSize: "18px",
    background: "linear-gradient(90deg, #4f63d2, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  paymentMadeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "#f0faf4",
    border: "1px solid #b8e6c9",
    borderRadius: "8px",
    px: "12px",
    py: "8px",
    mt: "8px",
  },
  paymentMadeLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#1e7d45",
  },
  paymentMadeValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    fontWeight: 700,
    color: "#1e7d45",
  },
  balanceDueRow: (isDue: boolean) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "10px",
    px: "14px",
    py: "10px",
    mt: "10px",
    border: `1.5px solid ${isDue ? "#fbbf24" : "#6ddc98"}`,
    bgcolor: isDue ? "#fffbeb" : "#f0fdf6",
  }),
  balanceDueLabel: (isDue: boolean) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "13.5px",
    color: isDue ? "#92400e" : "#14532d",
  }),
  balanceDueValue: (isDue: boolean) => ({
    fontFamily: "'DM Mono', monospace",
    fontWeight: 800,
    fontSize: "16px",
    color: isDue ? "#d97706" : "#15803d",
  }),
  // Terms section
  termsSection: {
    px: "36px",
    py: "20px",
    borderTop: "1px solid #ecedf5",
    bgcolor: "#fafbff",
  },
  termsLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#9196b0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 0.75,
  },
  termsText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: "#8b90a7",
    lineHeight: 1.65,
  },
  // Footer
  footer: {
    px: "36px",
    py: "16px",
    borderTop: "1px solid #ecedf5",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "#f8f9fc",
  },
  footerText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11.5px",
    color: "#bbbdc9",
  },
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 120 }}>
    <Typography sx={styles.metaLabel}>{label}</Typography>
    <Typography sx={styles.metaValue}>{value}</Typography>
  </Box>
);

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "paid": return { bg: "#f0fdf6", color: "#15803d", border: "#6ddc98" };
    case "overdue": return { bg: "#fff5f5", color: "#c0392b", border: "#f5a5a5" };
    case "draft": return { bg: "#f8f9fc", color: "#6b70a3", border: "#d0d3ea" };
    default: return { bg: "#fffbeb", color: "#92400e", border: "#fbbf24" };
  }
};

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoice,
  companyName = "Your Company",
  companyAddress = "Address, City, State",
}) => {
  const subTotal = invoice.sub_total || 0;
  const shippingCharges = invoice.shipping_charges || 0;
  const taxAmount = invoice.tax_amount || 0;
  const adjustment = invoice.adjustment || 0;
  const total = invoice.total || 0;
  const balanceDue = invoice.status === "paid" ? 0 : total - (invoice.payment_received ? total : 0);
  const statusColors = getStatusColor(invoice.status);

  return (
    <Box sx={styles.root}>
      <Paper elevation={0} sx={styles.paper}>

        {/* Top gradient accent bar */}
        <Box sx={styles.accentBar} />

        {/* ── Header ── */}
        <Box sx={styles.headerSection}>
          <Box>
            <Box sx={styles.logoBox}>
              <Typography sx={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>
                {companyName.slice(0, 2).toUpperCase()}
              </Typography>
            </Box>
            <Typography sx={styles.companyName}>{companyName}</Typography>
            <Typography sx={styles.companyAddress}>{companyAddress}</Typography>
          </Box>

          <Box sx={styles.invoiceTitle}>
            <Typography sx={styles.invoiceTitleText}>Tax Invoice</Typography>
            <Box sx={styles.invoiceNumberBadge}>
              #{invoice.invoice_number}
            </Box>
            {invoice.subject && (
              <Typography sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "#8b90a7",
                mt: 1,
                textAlign: "right",
                maxWidth: 220,
                ml: "auto",
              }}>
                {invoice.subject}
              </Typography>
            )}
            {invoice.status && (
              <Box sx={{ mt: 1.5, textAlign: "right" }}>
                <Box
                  component="span"
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    px: 1.5,
                    py: 0.6,
                    borderRadius: "20px",
                    bgcolor: statusColors.bg,
                    color: statusColors.color,
                    border: `1px solid ${statusColors.border}`,
                  }}
                >
                  {invoice.status}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Invoice Meta ── */}
        <Box sx={styles.metaSection}>
          <Box sx={{ display: "flex", alignItems: "stretch", flexWrap: "wrap", gap: "24px" }}>
            <MetaItem label="Invoice Date" value={dayjs(invoice.invoice_date).format("DD MMM YYYY")} />
            <Box sx={styles.metaDivider} />
            <MetaItem label="Due Date" value={dayjs(invoice.due_date).format("DD MMM YYYY")} />
            <Box sx={styles.metaDivider} />
            <MetaItem label="Terms" value={invoice.terms?.replace("_", " ") || "Due on Receipt"} />
            {invoice.order_number && (
              <>
                <Box sx={styles.metaDivider} />
                <MetaItem label="Order No." value={invoice.order_number} />
              </>
            )}
            {invoice.salesperson && (
              <>
                <Box sx={styles.metaDivider} />
                <MetaItem label="Salesperson" value={invoice.salesperson.name} />
              </>
            )}
          </Box>
        </Box>

        {/* ── Bill To / Ship To ── */}
        <Box sx={styles.addressSection}>
          <Grid container spacing={2.5}>
            {[
              { label: "Bill To", data: invoice.customer },
              { label: "Ship To", data: invoice.customer },
            ].map(({ label, data }) => (
              <Grid key={label} size={{ xs: 12, sm: 6 }}>
                <Box sx={styles.addressCard}>
                  <Box sx={styles.addressCardAccent} />
                  <Typography sx={{ ...styles.addressLabel, pl: "14px" }}>{label}</Typography>
                  <Box sx={{ pl: "14px" }}>
                    <Typography sx={styles.addressName}>
                      {data?.display_name || "Customer Name"}
                    </Typography>
                    {data?.email && (
                      <Typography sx={styles.addressDetail}>{data.email}</Typography>
                    )}
                    {data?.phone && (
                      <Typography sx={styles.addressDetail}>{data.phone}</Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Line Items ── */}
        <Box sx={styles.tableSection}>
          <Table
            sx={{
              "& .MuiTableCell-root": { borderColor: "#ecedf5" },
            }}
          >
            <TableHead>
              <TableRow sx={styles.tableHeadRow}>
                <TableCell sx={{ ...styles.tableHeadCell, width: 48 }}>#</TableCell>
                <TableCell sx={styles.tableHeadCell}>Item & Description</TableCell>
                <TableCell align="center" sx={{ ...styles.tableHeadCell, width: 80 }}>Qty</TableCell>
                <TableCell align="right" sx={{ ...styles.tableHeadCell, width: 110 }}>Rate</TableCell>
                <TableCell align="right" sx={{ ...styles.tableHeadCell, width: 120 }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.line_items?.map((item, index) => (
                <TableRow key={index} sx={styles.tableBodyRow}>
                  <TableCell sx={styles.tableBodyCell}>
                    <Typography sx={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</Typography>
                  </TableCell>
                  <TableCell sx={styles.tableBodyCell}>
                    <Typography sx={styles.itemName}>{item.item?.name || "Item"}</Typography>
                    {item.description && (
                      <Typography sx={styles.itemDescription}>{item.description}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={styles.tableBodyCell}>
                    <Typography sx={styles.qtyRate}>{item.quantity}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={styles.tableBodyCell}>
                    <Typography sx={styles.qtyRate}>₹{item.rate?.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={styles.tableBodyCell}>
                    <Typography sx={styles.amount}>₹{item.amount?.toFixed(2)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
              {/* Empty state */}
              {(!invoice.line_items || invoice.line_items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 5, color: "#9196b0", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
                    No line items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* ── Totals + Notes ── */}
        <Box sx={styles.totalsSection}>
          {/* Notes */}
          <Box sx={{ flex: 1 }}>
            {invoice.customer_notes && (
              <Box>
                <Typography sx={styles.notesLabel}>Notes</Typography>
                <Typography sx={styles.notesText}>{invoice.customer_notes}</Typography>
              </Box>
            )}
          </Box>

          {/* Totals card */}
          <Box sx={styles.totalsBox}>
            <Box sx={styles.totalRow}>
              <Typography sx={styles.totalLabel}>Sub Total</Typography>
              <Typography sx={styles.totalValue}>₹{subTotal.toFixed(2)}</Typography>
            </Box>

            {shippingCharges > 0 && (
              <Box sx={styles.totalRow}>
                <Typography sx={styles.totalLabel}>Shipping</Typography>
                <Typography sx={styles.totalValue}>₹{shippingCharges.toFixed(2)}</Typography>
              </Box>
            )}

            {taxAmount > 0 && (
              <Box sx={styles.totalRow}>
                <Typography sx={styles.totalLabel}>
                  {invoice.tax?.name || `Tax (${invoice.tax?.rate || 0}%)`}
                </Typography>
                <Typography sx={styles.totalValue}>₹{taxAmount.toFixed(2)}</Typography>
              </Box>
            )}

            {adjustment !== 0 && (
              <Box sx={styles.totalRow}>
                <Typography sx={styles.totalLabel}>Adjustment</Typography>
                <Typography sx={styles.totalValue}>
                  {adjustment > 0 ? "+" : ""}₹{adjustment.toFixed(2)}
                </Typography>
              </Box>
            )}

            <Box sx={styles.totalDivider} />

            <Box sx={styles.grandTotalRow}>
              <Typography sx={styles.grandTotalLabel}>Total</Typography>
              <Typography sx={styles.grandTotalValue}>₹{total.toFixed(2)}</Typography>
            </Box>

            {invoice.payment_received && (
              <Box sx={styles.paymentMadeRow}>
                <Typography sx={styles.paymentMadeLabel}>Payment Made</Typography>
                <Typography sx={styles.paymentMadeValue}>
                  (₹{total.toFixed(2)})
                </Typography>
              </Box>
            )}

            <Box sx={styles.balanceDueRow(balanceDue > 0)}>
              <Typography sx={styles.balanceDueLabel(balanceDue > 0)}>Balance Due</Typography>
              <Typography sx={styles.balanceDueValue(balanceDue > 0)}>
                ₹{balanceDue.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Terms & Conditions ── */}
        {invoice.terms_and_conditions && (
          <Box sx={styles.termsSection}>
            <Typography sx={styles.termsLabel}>Terms & Conditions</Typography>
            <Typography sx={styles.termsText}>{invoice.terms_and_conditions}</Typography>
          </Box>
        )}

        {/* ── Footer ── */}
        <Box sx={styles.footer}>
          <Typography sx={styles.footerText}>
            Thank you for your business.
          </Typography>
          <Typography sx={styles.footerText}>
            Generated on {dayjs().format("DD MMM YYYY")}
          </Typography>
        </Box>

      </Paper>
    </Box>
  );
};