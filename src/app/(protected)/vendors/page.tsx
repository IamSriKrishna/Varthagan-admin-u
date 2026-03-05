"use client";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { Vendor, VendorListResponse } from "@/models/vendor.model";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Filter, PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { vendorService } from "@/lib/api/vendorService";

export default function VendorsPage() {
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState({ search: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  
  const debouncedSearch = useDebounce(filters.search, 500);

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const response: VendorListResponse = await vendorService.getVendors(
        page + 1,
        rowsPerPage,
        debouncedSearch.trim() || undefined
      );
      
      if (response.success) {
        setVendors(response.data || []);
        setTotalCount(response.pagination?.total || 0);
        setTotalPages(response.pagination?.total_pages || 0);
      } else {
        showToastMessage("Failed to fetch vendors", "error");
      }
    } catch (error: any) {
      showToastMessage(error.message || "Failed to fetch vendors", "error");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleDeleteVendor = useCallback(async (id: string | number) => {
    try {
      await vendorService.deleteVendor(id);
      showToastMessage("Vendor deleted successfully", "success");
      fetchVendors();
      setOpen(false);
    } catch (error: any) {
      showToastMessage(error.message || "Failed to delete vendor", "error");
    }
  }, [fetchVendors]);

  const handleDelete = async () => {
    if (!selectedId) return;
    await handleDeleteVendor(selectedId);
  };

  const getPrimaryContact = (vendor: Vendor): string => {
    if (vendor.work_phone) return vendor.work_phone;
    if (vendor.mobile) return vendor.mobile;
    return "Not provided";
  };

  const getAddressString = (vendor: Vendor): string => {
    if (vendor.billing_address) {
      const addr = vendor.billing_address;
      const parts = [
        addr.address_line1,
        addr.address_line2,
        addr.city,
        addr.state,
        addr.country_region,
        addr.pin_code
      ].filter(Boolean);
      return parts.join(", ") || "Not provided";
    }
    return "Not provided";
  };

  const columns: ITableColumn<Vendor>[] = [
    {
      key: "id" as keyof Vendor,
      label: "Vendor ID",
      render: (row) => <HighlightedCell value={String(row.id || "")} search={filters.search} />,
    },
    {
      key: "display_name" as keyof Vendor,
      label: "Display Name",
      render: (row) => <HighlightedCell value={row.display_name || ""} search={filters.search} />,
    },
    {
      key: "email_address" as keyof Vendor,
      label: "Email",
      render: (row) => <HighlightedCell value={row.email_address || "Not provided"} search={filters.search} />,
    },
    {
      key: "work_phone" as keyof Vendor,
      label: "Phone",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HighlightedCell value={getPrimaryContact(row)} search={filters.search} />
        </Box>
      ),
    },
    {
      key: "vendor_language" as keyof Vendor,
      label: "Language",
      render: (row) => <HighlightedCell value={row.vendor_language || "Not provided"} search={filters.search} />,
    },
    {
      key: "created_at" as keyof Vendor,
      label: "Registered",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HighlightedCell value={dayjs(row.created_at).format("DD MMM YYYY")} search={filters.search} />
        </Box>
      ),
    },
    {
      key: "action" as any,
      label: "Action",
      render: (row) => (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/vendors/vendor/${row.id}`)}
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row.id || "");
              setOpen(true);
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
      <BBLoader enabled={loading} />

      <BBTitle
        title="Vendors Management"
        rightContent={
          <BBButton variant="outlined" startIcon={<Filter size={18} />} onClick={() => setFilterOpen(!filteropen)}>
            {filteropen ? "Hide Filters" : "Show Filters"}
          </BBButton>
        }
      />

      <Box
        sx={{
          borderRadius: "10px 10px 0 0",
          boxShadow: "none",
        }}
        component={Paper}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ p: 2 }}
        >
          <Box>
            <BBInputBase
              label=""
              name="search"
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search by name, email, or company"
            />
          </Box>
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/vendors/vendor/new")}
            startIcon={<Plus size={18} />}
          >
            Add New Vendor
          </BBButton>
        </Stack>
      </Box>
      
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <BBTable
          data={vendors}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
        />
      </Box>
      
      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Vendor"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete this vendor?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this vendor will be permanently removed.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}