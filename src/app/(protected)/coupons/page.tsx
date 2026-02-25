"use client";

import { config } from "@/config";
import { coupon } from "@/constants/apiConstants";
import { activeTypescategories } from "@/constants/commonConstans";
import { coupon_Type, couponScopeOptions } from "@/constants/couponsConstans";
import useApi from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Filter, PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as classes from "../../../styles/listtable.styles";
import { ICoupon, ICouponResponse } from "@/models/ICoupon";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function Coupons() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteropen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ search: "", coupon_type: "", active: "", scope: "" });
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const debouncedSearch = useDebounce(filters.search, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch.trim()) params.append("search", debouncedSearch.trim());
    if (filters.active?.trim()) params.append("is_active", filters.active);
    if (filters.coupon_type?.trim()) params.append("coupon_type", filters.coupon_type);
    if (filters.scope?.trim()) params.append("scope", filters.scope);
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));
    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);

  const {
    data: results,
    refetch,
    loading,
  } = useFetch<ICouponResponse>({
    url: `${coupon.getCoupons}?${queryParams}`,
    baseUrl: config.orderDomain,
  });

  const { mutateApi: deleteCoupon } = useApi<ApiResponse<null>>("", "DELETE", undefined, config.orderDomain);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const response = await deleteCoupon(undefined, coupon.getCouponById(selectedId));
      if (response?.success) {
        showToastMessage(response.message || "Coupon deleted successfully", "success");
        refetch();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const columns: ITableColumn<ICoupon>[] = [
    {
      key: "code",
      label: "Code",
      render: (row) => (
        <Typography variant="body2" noWrap>
          <HighlightedCell value={row.code} search={filters.search} />
        </Typography>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <Typography variant="body2" noWrap>
          <HighlightedCell value={row.title} search={filters.search} />
        </Typography>
      ),
    },
    {
      key: "coupon_type",
      label: "Discount / Min Order",
      render: (row: ICoupon) => (
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Discount Value:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} color="success.main">
              {row.coupon_type === "percentage" ? `${row.discount_value}%` : `₹${row.discount_value}`}
            </Typography>
          </Box>

          {row.max_discount && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Max Discount:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                ₹{row.max_discount}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Min Order Value:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              ₹{row.min_order_value}
            </Typography>
          </Box>
        </Box>
      ),
      cellStyle: {
        minWidth: 180,
      },
    },
    {
      key: "scope",
      label: "Scope / Type",
      render: (row: ICoupon) => (
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Scope:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {row?.scope ? row.scope.charAt(0).toUpperCase() + row.scope.slice(1) : "-"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Type:{" "}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {row?.coupon_type ? row.coupon_type.charAt(0).toUpperCase() + row.coupon_type.slice(1) : "-"}
            </Typography>
          </Box>
        </Box>
      ),
      cellStyle: {
        minWidth: 150,
      },
    },

    {
      key: "starts_at",
      label: "Validity",
      render: (row: ICoupon) => {
        const startsAt = row.starts_at ? dayjs(row.starts_at).format("DD MMM YYYY") : "-";
        const expiresAt = row.expires_at ? dayjs(row.expires_at).format("DD MMM YYYY") : "-";

        return (
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Start At:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {startsAt}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Expire At:
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {expiresAt}
              </Typography>
            </Box>
          </Box>
        );
      },
      cellStyle: {
        minWidth: 205,
      },
    },
    {
      key: "max_usage_per_customer",
      label: "Usage / Expiry",
      render: (row) => (
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Max Per Customer:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {row.max_usage_per_customer}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Usage Count:
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {row.current_usage_count}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Expires in Days:
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color={row?.expires_in_days !== undefined && row.expires_in_days <= 5 ? "error.main" : "text.primary"}
            >
              {row.expires_in_days} days
            </Typography>
          </Box>
        </Box>
      ),
      cellStyle: {
        minWidth: 200,
      },
    },

    {
      key: "is_active",
      label: "Status",
      render: (row) => {
        const label = row.is_active ? "Active" : "Inactive";
        return <Box sx={classes.getStatusTypeBadge(row.is_active ? "active" : "inactive")}>{label}</Box>;
      },
    },

    {
      key: "action",
      label: "Action",
      render: (row) => (
        <>
          <IconButton size="small" color="primary" onClick={() => router.push(`/coupons/coupon/${row.id}`)}>
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row?.id ?? "");
              setOpen(true);
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </>
      ),
    },
  ];

  const handleTypeChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr" }}>
      <BBLoader enabled={loading} />

      <BBTitle
        title="Coupons"
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
          <Grid container spacing={2} sx={{ mb: 2, p: 2 }}>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <BBDropdownBase
                name="coupon_type"
                label="Coin"
                value={filters.coupon_type}
                options={[{ value: "", label: "All" }, ...coupon_Type]}
                onDropdownChange={(e, _name, val) => handleTypeChange("coupon_type", val as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <BBDropdownBase
                name="scope"
                label="Scope"
                value={filters.scope}
                options={[{ value: "", label: "All" }, ...couponScopeOptions]}
                onDropdownChange={(e, _name, val) => handleTypeChange("scope", val as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <BBDropdownBase
                name="active"
                label="Status"
                value={filters.active}
                options={[{ value: "", label: "All" }, ...activeTypescategories]}
                onDropdownChange={(e, _name, val) => handleTypeChange("active", val as string)}
              />
            </Grid>
          </Grid>
          <Divider />
        </Collapse>

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
              value={filters.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search Coupons"
            />
          </Box>
          <BBButton
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => router.push("/coupons/coupon/new")}
          >
            Add New Coupon
          </BBButton>
        </Stack>
      </Box>

      <Box sx={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <BBTable
          data={results?.coupons ?? []}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={results?.meta.total ?? 0}
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
        title="Delete Coupon"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to delete this coupon?</Typography>
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
