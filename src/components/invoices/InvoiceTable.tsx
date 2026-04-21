"use client";

import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import { IInvoice } from "@/models/IInvoice";
import { Box, Chip, Typography, IconButton, Tooltip } from "@mui/material";
import dayjs from "dayjs";
import { Edit2, Eye, Trash2, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface InvoiceTableProps {
  data: IInvoice[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onEdit?: (invoice: IInvoice) => void;
  onDelete?: (invoice: IInvoice) => void;
  onStatusUpdate?: (invoice: IInvoice) => void;
}

const statusColorMap: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
  draft: "default",
  sent: "info",
  partial: "warning",
  paid: "success",
  overdue: "error",
  void: "error",
};

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onStatusUpdate,
}) => {
  const router = useRouter();

  const columns: ITableColumn<IInvoice>[] = [
    {
      key: "invoice_date" as keyof IInvoice,
      label: "DATE",
      render: (row) => (
        <Typography variant="body2">
          {dayjs(row.invoice_date).format("DD/MM/YYYY")}
        </Typography>
      ),
      cellStyle: { minWidth: 100 },
    },
    {
      key: "invoice_number" as keyof IInvoice,
      label: "INVOICE#",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: "#1976d2",
            cursor: "pointer",
            fontWeight: 600,
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => router.push(`/invoices/${row.id}`)}
        >
          {row.invoice_number}
        </Typography>
      ),
      cellStyle: { minWidth: 120 },
    },
    {
      key: "order_number" as keyof IInvoice,
      label: "ORDER NUMBER",
      render: (row) => (
        <Typography variant="body2">
          {row.order_number || "-"}
        </Typography>
      ),
      cellStyle: { minWidth: 130 },
    },
    {
      key: "customer" as keyof IInvoice,
      label: "CUSTOMER NAME",
      render: (row) => (
        <Typography variant="body2">
          {row.customer?.display_name || row.customer?.company_name || "Unknown"}
        </Typography>
      ),
      cellStyle: { minWidth: 150, maxWidth: 200 },
    },
    {
      key: "status" as keyof IInvoice,
      label: "STATUS",
      render: (row) => (
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          color={statusColorMap[row.status] || "default"}
          size="small"
          variant="outlined"
        />
      ),
      cellStyle: { minWidth: 100 },
    },
    {
      key: "due_date" as keyof IInvoice,
      label: "DUE DATE",
      render: (row) => (
        <Typography variant="body2">
          {dayjs(row.due_date).format("DD/MM/YYYY")}
        </Typography>
      ),
      cellStyle: { minWidth: 100 },
    },
    {
      key: "total" as keyof IInvoice,
      label: "AMOUNT",
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ₹{row.total?.toLocaleString("en-IN") || "0.00"}
        </Typography>
      ),
      cellStyle: { minWidth: 120, textAlign: "right" },
    },
    {
      key: "id" as keyof IInvoice,
      label: "BALANCE DUE",
      render: (row) => {
        const balanceDue = row.status === "paid" ? 0 : row.total - (row.payment_received ? row.total : 0);
        return (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ₹{balanceDue?.toLocaleString("en-IN") || "0.00"}
          </Typography>
        );
      },
      cellStyle: { minWidth: 120, textAlign: "right" },
    },
    {
      key: "id" as keyof IInvoice,
      label: "ACTIONS",
      render: (row) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="View Invoice">
            <IconButton
              size="small"
              onClick={() => router.push(`/invoices/${row.id}`)}
              title="View Invoice"
            >
              <Eye size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Update Status">
            <IconButton
              size="small"
              onClick={() => onStatusUpdate?.(row)}
              title="Update Status"
            >
              <MoreVertical size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Invoice">
            <IconButton
              size="small"
              onClick={() => onEdit?.(row)}
              title="Edit Invoice"
            >
              <Edit2 size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Invoice">
            <IconButton
              size="small"
              onClick={() => onDelete?.(row)}
              title="Delete Invoice"
              sx={{ color: "error.main" }}
            >
              <Trash2 size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      cellStyle: { minWidth: 130 },
    },
  ];

  return (
    <BBTable
      columns={columns}
      data={data}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={onPageChange}
      onRowsPerPageChange={onRowsPerPageChange}
      totalCount={totalCount}
    />
  );
};
