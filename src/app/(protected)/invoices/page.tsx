"use client";

import { invoices } from "@/constants/apiConstants";
import { config } from "@/config";
import { IInvoice, IInvoiceListResponse } from "@/models/IInvoice";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBTitle, BBLoader } from "@/lib";
import { appFetch } from "@/utils/fetchInterceptor";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Paper, Stack, Collapse, Grid, Typography, TextField, MenuItem, Select } from "@mui/material";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect } from "react";
import { InvoiceTable } from "@/components/invoices/InvoiceTable";
import { useDebounce } from "@/hooks/useDebounce";

export default function InvoicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const debouncedSearch = useDebounce(filters.search, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    if (filters.search && debouncedSearch) {
      params.append("search", debouncedSearch);
    }

    if (filters.status && filters.status.trim()) {
      params.append("status", filters.status);
    }

    return params.toString();
  }, [page, rowsPerPage, filters, debouncedSearch]);

  const { data: result, refetch, loading } = useFetch<IInvoiceListResponse>({
    url: `${invoices.getInvoices}?${queryParams}`,
    baseUrl: config.apiDomain || config.customerDomain,
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRows: number) => {
    setRowsPerPage(newRows);
    setPage(0);
  };

  const handleEdit = (invoice: IInvoice) => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDelete = async (invoice: IInvoice) => {
    if (
      window.confirm(
        `Are you sure you want to delete invoice ${invoice.invoice_number}?`
      )
    ) {
      try {
        const apiDomain = config.apiDomain || config.customerDomain || "";
        const response = await appFetch(
          `${apiDomain}${invoices.deleteInvoice(invoice.id || "")}`,
          { method: "DELETE" }
        );

        const result = await response.json();

        if (response.ok && result.success) {
          showToastMessage("Invoice deleted successfully", "success");
          refetch();
        } else {
          showToastMessage(result.message || "Failed to delete invoice", "error");
        }
      } catch (error: any) {
        showToastMessage(error?.message || "Failed to delete invoice", "error");
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <BBTitle title="All Invoices" />
          <BBButton
            variant="contained"
            onClick={() => router.push("/invoices/new")}
          >
            + New
          </BBButton>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              cursor: "pointer",
              mb: filterOpen ? 2 : 0,
            }}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={20} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
          </Box>

          <Collapse in={filterOpen}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                placeholder="Search invoices..."
                variant="outlined"
                size="small"
                sx={{ minWidth: 200 }}
                value={filters.search}
                onChange={(e) => {
                  setFilters({ ...filters, search: e.target.value });
                  setPage(0);
                }}
              />

              <Select
                size="small"
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPage(0);
                }}
                displayEmpty
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="partial">Partial</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
                <MenuItem value="void">Void</MenuItem>
              </Select>
            </Box>
          </Collapse>
        </Paper>

        {/* Table */}
        {loading ? (
          <BBLoader />
        ) : (
          <InvoiceTable
            data={result?.invoices || []}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={result?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Stack>
    </Box>
  );
}
