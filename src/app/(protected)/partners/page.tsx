"use client";
import { config } from "@/config";
import { partners, usermangement } from "@/constants/apiConstants";
import { activeTypescategories } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { IPartner, IPartnersResponse } from "@/models/IPartners";
import { RootState } from "@/store";
import { FileDropStyle, getStatusTypeBadge } from "@/styles/listtable.styles";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { EyeIcon, Filter, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function PartnersPage() {
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    active: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);

  const selectedVendorId = useSelector((s: RootState) => s.vendors?.selectedVendorId ?? null);
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedVendorId) {
      params.append("vendor_id", String(selectedVendorId));
    }
    if (debouncedSearch && debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }
    if (filters.active !== undefined && filters.active !== null && String(filters.active).trim()) {
      params.append("is_active", String(filters.active).trim());
    }
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    return params.toString();
  }, [selectedVendorId, filters.active, debouncedSearch, page, rowsPerPage]);

  const {
    data: results,
    loading,
    refetch,
  } = useFetch<IPartnersResponse>({
    url: `${partners.getPartners}?${queryParams}`,
    baseUrl: config.partnerDomain,
  });

  const { mutateApi: deletePartner } = useApi<ApiResponse<null>>("", "DELETE", undefined, config.loginDomain);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${usermangement.deleteUser}/${selectedId}`;
      const response = await deletePartner(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Partner deactivated successfully", "success");
        refetch();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e == "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const columns: ITableColumn<IPartner>[] = [
    {
      key: "user_id",
      label: "Partner ID",
      render: (row) => <HighlightedCell value={row.user_id} search={filters.search} />,
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HighlightedCell value={row.email} search={filters.search} />
        </Box>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HighlightedCell value={row.name || "Not provided"} search={filters.search} />
        </Box>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HighlightedCell value={row.phone || "Not provided"} search={filters.search} />
        </Box>
      ),
    },

    {
      key: "is_active",
      label: "Status",
      render: (row) => {
        const status = row?.is_active ? "active" : "inactive";
        const label = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <Box sx={getStatusTypeBadge(status)}>
            <HighlightedCell value={label} search={filters?.search} />
          </Box>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (row) => <HighlightedCell value={dayjs(row.created_at).format("DD MMM YYYY")} search={filters.search} />,
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" color="primary" onClick={() => router.push(`/partners/partner/${row.id}/view`)}>
            <EyeIcon size={16} />
          </IconButton>
          {row.is_active && (
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedId(row?.user_id || "");
                setOpen(true);
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          )}
        </Box>
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
        title="Partners Management"
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
        <Collapse in={filteropen} timeout="auto" unmountOnExit>
          <Typography variant="h6" sx={FileDropStyle}>
            Filter
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2, p: 2 }}>
            <BBDropdownBase
              name="active"
              label="Status"
              value={filters.active}
              options={[{ value: "", label: "All" }, ...activeTypescategories]}
              onDropdownChange={(e, _name, val) => handleTypeChange("active", val as string)}
            />
          </Box>
          <Divider />
        </Collapse>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ p: 2 }}
        >
          {" "}
          <Box>
            <BBInputBase
              label=""
              name="search"
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search Partner"
            />
          </Box>{" "}
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/partners/partner/new")}
            startIcon={<Plus size={18} />}
          >
            Add New Partner
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
          data={results?.data?.partners ?? []}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={results?.meta?.total ?? 0}
          onPageChange={(newPage) => setPage(newPage)}
          onRowsPerPageChange={(newRows) => {
            setRowsPerPage(newRows);
            setPage(0);
          }}
        />
      </Box>

      <BBDialog
        open={open}
        title="Deactivate Partner"
        content={<Typography>Are you sure you want to deactivate this partner?</Typography>}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        confirmText="Deactivate"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}
