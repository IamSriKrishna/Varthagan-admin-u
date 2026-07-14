"use client";

import React from "react";
import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, Grid } from "@mui/material";
import { IInvoice } from "@/models/IInvoice";
import dayjs from "dayjs";

interface InvoiceDetailViewProps {
  invoice: IInvoice;
  companyName?: string;
  companyAddress?: string;
}

// ── Brand gradient ──────────────────────────────────────────────
const GRADIENT = "linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)";
const GRADIENT_SOFT = "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(34,211,238,0.08) 100%)";
const INK = "#151726";
const SUB = "#8489A3";

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    width: "100%",
    bgcolor: "transparent",
    p: { xs: 0, sm: 1.5, lg: 2 },
  },
  paper: {
    borderRadius: { xs: 0, sm: "20px" },
    border: "1px solid #e6e8f3",
    bgcolor: "#ffffff",
    boxShadow: "0 20px 60px -20px rgba(93, 68, 210, 0.18), 0 2px 8px rgba(23, 20, 60, 0.04)",
    overflow: "hidden",
    width: "100%",
    maxWidth: "none",
    mx: 0,
    position: "relative" as const,
  },
  accentBar: {
    height: "5px",
    background: GRADIENT,
  },

  // ── Header ── company + title + status, condensed into one band
  headerSection: {
    p: { xs: "22px 20px", md: "32px 38px 28px", xl: "36px 46px 32px" },
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 3,
    flexDirection: { xs: "column", sm: "row" },
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  headerGlow: {
    position: "absolute" as const,
    top: "-60px",
    right: "-60px",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: GRADIENT,
    opacity: 0.08,
    filter: "blur(10px)",
    pointerEvents: "none" as const,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: "12px",
    background: GRADIENT,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 1.25,
    boxShadow: "0 6px 16px rgba(139, 92, 246, 0.35)",
  },
  companyName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: "16px",
    color: INK,
    letterSpacing: "-0.3px",
    lineHeight: 1.3,
  },
  companyAddress: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    color: SUB,
    mt: 0.4,
    lineHeight: 1.5,
    maxWidth: 220,
  },
  invoiceTitle: {
    textAlign: { xs: "left", sm: "right" },
    width: { xs: "100%", sm: "auto" },
    position: "relative" as const,
    zIndex: 1,
  },
  invoiceTitleText: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: { xs: "22px", md: "28px" },
    letterSpacing: "2.5px",
    color: INK,
    textTransform: "uppercase" as const,
    lineHeight: 1,
  },
  invoiceNumberBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "12.5px",
    color: "#fff",
    background: GRADIENT,
    borderRadius: "6px",
    px: 1.4,
    py: 0.5,
    display: "inline-block",
    fontWeight: 700,
    mt: 1,
    boxShadow: "0 4px 10px rgba(139, 92, 246, 0.3)",
  },
  statusPill: (status?: string) => {
    const c = getStatusColor(status);
    return {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      fontSize: "10.5px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.9px",
      px: 1.3,
      py: 0.45,
      borderRadius: "20px",
      bgcolor: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      display: "inline-block",
      mt: 1,
    };
  },

  // ── Compact meta strip: dates + terms + bill-to/ship-to in one row ──
  infoStrip: {
    px: { xs: "20px", md: "38px", xl: "46px" },
    py: { xs: "16px", md: "20px" },
    display: "grid",
    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
    gap: { xs: "16px", md: "24px" },
    background: GRADIENT_SOFT,
    borderTop: "1px solid #eef0fb",
    borderBottom: "1px solid #eef0fb",
  },
  metaLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10px",
    fontWeight: 700,
    color: "#9A79E8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 0.3,
  },
  metaValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "12.5px",
    fontWeight: 600,
    color: "#2A2D45",
  },

  // ── Address cards ──
  addressSection: {
    px: { xs: "20px", md: "38px", xl: "46px" },
    pt: { xs: "20px", md: "28px" },
    pb: { xs: "18px", md: "24px" },
  },
  addressCard: {
    borderRadius: "16px",
    p: { xs: "16px", md: "20px" },
    position: "relative" as const,
    overflow: "hidden" as const,
    height: "100%",
    bgcolor: "#fafaff",
    border: "1px solid #ecedf8",
  },
  addressLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10px",
    fontWeight: 800,
    color: "transparent",
    background: GRADIENT,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    mb: 0.75,
  },
  addressName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "13.5px",
    color: INK,
    mb: 0.25,
  },
  addressDetail: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    color: SUB,
    lineHeight: 1.55,
  },

  // ── Table ──
  tableSection: {
    px: { xs: 0, sm: "20px", md: "38px", xl: "46px" },
    pb: 0,
    overflowX: "auto",
  },
  tableHeadRow: {
    background: "linear-gradient(90deg, rgba(139,92,246,0.06), rgba(34,211,238,0.06))",
  },
  tableHeadCell: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: "10.5px",
    color: "#6C63B5",
    textTransform: "uppercase" as const,
    letterSpacing: "0.7px",
    py: "10px",
    borderBottom: "1.5px solid #e6e8f7",
  },
  tableBodyRow: {
    "&:hover": { bgcolor: "#f8f7ff" },
    "&:last-child td": { borderBottom: "none" },
    transition: "background 0.15s",
  },
  tableBodyCell: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    color: "#2A2D45",
    py: "11px",
    borderColor: "#f0f1f9",
  },
  itemIndex: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    color: "#B0B4CC",
    fontWeight: 700,
  },
  itemName: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    fontSize: "13.5px",
    color: INK,
  },
  itemDescription: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    color: SUB,
    mt: 0.15,
    display: "block",
  },
  qtyRate: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "12.5px",
    color: "#565A80",
  },
  amount: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "13px",
    fontWeight: 800,
    color: INK,
  },

  // ── Totals + notes, tightened ──
  totalsSection: {
    px: { xs: "20px", md: "38px", xl: "46px" },
    py: { xs: "24px", md: "30px" },
    display: "grid",
    gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
    gap: { xs: "24px", md: "36px" },
    alignItems: "flex-start",
  },
  notesBox: { minWidth: 0 },
  notesLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10px",
    fontWeight: 800,
    color: "#9196b0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 0.75,
  },
  notesText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: "#6b6f8a",
    lineHeight: 1.65,
    maxWidth: 620,
  },
  totalsBox: {
    width: "100%",
    minWidth: 0,
    bgcolor: "#fafaff",
    border: "1px solid #ecedf8",
    borderRadius: "18px",
    p: { xs: "18px", md: "22px" },
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    py: "4px",
  },
  totalLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12.5px",
    color: "#6b70a3",
  },
  totalValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "12.5px",
    color: "#2d3058",
    fontWeight: 600,
  },
  totalDivider: {
    height: "1px",
    background: "linear-gradient(90deg, transparent, #dcdff0, transparent)",
    my: "8px",
  },
  grandTotalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    my: 0.75,
  },
  grandTotalLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: "14px",
    color: INK,
  },
  grandTotalValue: {
    fontFamily: "'DM Mono', monospace",
    fontWeight: 800,
    fontSize: "19px",
    background: GRADIENT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  paymentMadeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    bgcolor: "#f0faf4",
    border: "1px solid #b8e6c9",
    borderRadius: "8px",
    px: "10px",
    py: "6px",
    mt: "6px",
  },
  paymentMadeLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    fontWeight: 700,
    color: "#1e7d45",
  },
  paymentMadeValue: {
    fontFamily: "'DM Mono', monospace",
    fontSize: "12.5px",
    fontWeight: 800,
    color: "#1e7d45",
  },
  balanceDueRow: (isDue: boolean) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "10px",
    px: "12px",
    py: "9px",
    mt: "8px",
    border: isDue ? "1.5px solid transparent" : "1.5px solid #6ddc98",
    background: isDue ? `linear-gradient(#fffaf0, #fffaf0) padding-box, ${GRADIENT} border-box` : "#f0fdf6",
  }),
  balanceDueLabel: (isDue: boolean) => ({
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 800,
    fontSize: "13px",
    color: isDue ? "#6C3FD1" : "#14532d",
  }),
  balanceDueValue: (isDue: boolean) => ({
    fontFamily: "'DM Mono', monospace",
    fontWeight: 800,
    fontSize: "16px",
    ...(isDue
      ? {
          background: GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }
      : { color: "#15803d" }),
  }),

  // ── Terms ──
  termsSection: {
    px: { xs: "20px", md: "38px", xl: "46px" },
    py: { xs: "18px", md: "22px" },
    borderTop: "1px solid #f0f1f9",
  },
  termsLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "10px",
    fontWeight: 800,
    color: "#9196b0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.8px",
    mb: 0.5,
  },
  termsText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "12px",
    color: "#8b90a7",
    lineHeight: 1.6,
  },

  // ── Footer ──
  footer: {
    px: { xs: "20px", md: "38px", xl: "46px" },
    py: { xs: "16px", md: "18px" },
    borderTop: "1px solid #f0f1f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: { xs: "flex-start", sm: "center" },
    flexDirection: { xs: "column", sm: "row" },
    gap: 1,
    background: GRADIENT_SOFT,
  },
  footerText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    color: "#A5A9C2",
  },
};

const MetaItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
    <Typography sx={styles.metaLabel}>{label}</Typography>
    <Typography sx={styles.metaValue}>{value}</Typography>
  </Box>
);

function getStatusColor(status?: string) {
  switch (status?.toLowerCase()) {
    case "paid":
      return { bg: "#f0fdf6", color: "#15803d", border: "#6ddc98" };
    case "overdue":
      return { bg: "#fff5f5", color: "#c0392b", border: "#f5a5a5" };
    case "draft":
      return { bg: "#f4f2ff", color: "#6C3FD1", border: "#d8cdfb" };
    default:
      return { bg: "#fffbeb", color: "#92400e", border: "#fbbf24" };
  }
}

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

  return (
    <Box sx={styles.root}>
      <Paper elevation={0} sx={styles.paper}>
        {/* Top gradient accent bar */}
        <Box sx={styles.accentBar} />

        {/* ── Header ── */}
        <Box sx={styles.headerSection}>
          <Box sx={styles.headerGlow} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={styles.logoBox}>
              <Typography
                sx={{
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                {companyName.slice(0, 2).toUpperCase()}
              </Typography>
            </Box>
            <Typography sx={styles.companyName}>{companyName}</Typography>
            <Typography sx={styles.companyAddress}>{companyAddress}</Typography>
          </Box>

          <Box sx={styles.invoiceTitle}>
            <Typography sx={styles.invoiceTitleText}>Tax Invoice</Typography>
            <Box sx={styles.invoiceNumberBadge}>#{invoice.invoice_number}</Box>
            {invoice.subject && (
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11.5px",
                  color: SUB,
                  mt: 1,
                  textAlign: { xs: "left", sm: "right" },
                  maxWidth: 320,
                  ml: { xs: 0, sm: "auto" },
                }}
              >
                {invoice.subject}
              </Typography>
            )}
            {invoice.status && (
              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Box component="span" sx={styles.statusPill(invoice.status)}>
                  {invoice.status}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Compact info strip: dates / terms / order / salesperson ── */}
        <Box sx={styles.infoStrip}>
          <MetaItem label="Invoice Date" value={dayjs(invoice.invoice_date).format("DD MMM YYYY")} />
          <MetaItem label="Due Date" value={dayjs(invoice.due_date).format("DD MMM YYYY")} />
          <MetaItem label="Terms" value={invoice.terms?.replace("_", " ") || "Due on Receipt"} />
          {invoice.order_number && <MetaItem label="Order No." value={invoice.order_number} />}
          {invoice.salesperson && <MetaItem label="Salesperson" value={invoice.salesperson.name} />}
        </Box>

        {/* ── Bill To / Ship To ── */}
        <Box sx={styles.addressSection}>
          <Grid container spacing={2}>
            {[
              { label: "Bill To", data: invoice.customer },
              { label: "Ship To", data: invoice.customer },
            ].map(({ label, data }) => (
              <Grid key={label} size={{ xs: 12, sm: 6 }}>
                <Box sx={styles.addressCard}>
                  <Typography sx={styles.addressLabel}>{label}</Typography>
                  <Typography sx={styles.addressName}>{data?.display_name || "Customer Name"}</Typography>
                  {data?.email && <Typography sx={styles.addressDetail}>{data.email}</Typography>}
                  {data?.phone && <Typography sx={styles.addressDetail}>{data.phone}</Typography>}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Line Items ── */}
        <Box sx={styles.tableSection}>
          <Table sx={{ minWidth: 760, "& .MuiTableCell-root": { borderColor: "#f0f1f9" } }}>
            <TableHead>
              <TableRow sx={styles.tableHeadRow}>
                <TableCell sx={{ ...styles.tableHeadCell, width: 40 }}>#</TableCell>
                <TableCell sx={styles.tableHeadCell}>Item & Description</TableCell>
                <TableCell align="center" sx={{ ...styles.tableHeadCell, width: 70 }}>
                  Qty
                </TableCell>
                <TableCell align="right" sx={{ ...styles.tableHeadCell, width: 100 }}>
                  Rate
                </TableCell>
                <TableCell align="right" sx={{ ...styles.tableHeadCell, width: 110 }}>
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.line_items?.map((item, index) => (
                <TableRow key={index} sx={styles.tableBodyRow}>
                  <TableCell sx={styles.tableBodyCell}>
                    <Typography sx={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</Typography>
                  </TableCell>
                  <TableCell sx={styles.tableBodyCell}>
                    <Typography sx={styles.itemName}>{(item as any).product_name || item.item?.name || item.description || "Item"}</Typography>
                    {(item as any).product_name && (
                      <Typography sx={styles.itemDescription}>{(item as any).product_name}</Typography>
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
              {(!invoice.line_items || invoice.line_items.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4, color: "#9196b0", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                  >
                    No line items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* ── Totals + Notes ── */}
        <Box sx={styles.totalsSection}>
          <Box sx={styles.notesBox}>
            {invoice.customer_notes && (
              <>
                <Typography sx={styles.notesLabel}>Notes</Typography>
                <Typography sx={styles.notesText}>{invoice.customer_notes}</Typography>
              </>
            )}
          </Box>

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
                <Typography sx={styles.paymentMadeValue}>(₹{total.toFixed(2)})</Typography>
              </Box>
            )}

            <Box sx={styles.balanceDueRow(balanceDue > 0)}>
              <Typography sx={styles.balanceDueLabel(balanceDue > 0)}>Balance Due</Typography>
              <Typography sx={styles.balanceDueValue(balanceDue > 0)}>₹{balanceDue.toFixed(2)}</Typography>
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
          <Typography sx={styles.footerText}>Thank you for your business.</Typography>
          <Typography sx={styles.footerText}>Generated on {dayjs().format("DD MMM YYYY")}</Typography>
        </Box>
      </Paper>
    </Box>
  );
};
