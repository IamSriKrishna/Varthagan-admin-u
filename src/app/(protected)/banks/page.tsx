"use client";
import { bank } from "@/constants/apiConstants";
import { activeTypesBanks } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import IBank from "@/models/IBank";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, Grid, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";
import { Filter, PencilLine, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import * as classes from "../../../styles/listtable.styles";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BankListResponse = {
  success: boolean;
  data: IBank[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

export default function Banks() {
  const [page, setPage] = useState(0);
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<IBank>>({
    bank_name: "",
    bank_code: "",
    short_name: "",
    is_active: true,
  });
  const [editMode, setEditMode] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    is_active: "",
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }
    if (filters.is_active !== undefined && filters.is_active !== null && String(filters.is_active).trim()) {
      params.append("is_active", String(filters.is_active).trim());
    }
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);

  const {
    data: results,
    refetch,
    loading,
  } = useFetch<BankListResponse>({
    url: `${bank.getBanks}?${queryParams}`,
  });

  const { mutateApi: deleteBank } = useApi<ApiResponse<null>>("", "DELETE");
  const { mutateApi: createBank } = useApi<ApiResponse<IBank>>("", "POST");
  const { mutateApi: updateBank } = useApi<ApiResponse<IBank>>("", "PUT");

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${bank.postBank}/${selectedId}`;
      const response = await deleteBank(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Bank deleted successfully", "success");
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

  const handleSubmit = async () => {
    if (!formData.bank_name?.trim()) {
      showToastMessage("Bank name is required", "error");
      return;
    }

    try {
      if (editMode && selectedId) {
        const updateUrl = `${bank.postBank}/${selectedId}`;
        const response = await updateBank(formData, updateUrl);
        if (response?.success) {
          showToastMessage(response.message || "Bank updated successfully", "success");
          refetch();
          setOpenForm(false);
          resetForm();
        } else {
          showToastMessage(response?.message ?? "Update failed", "error");
        }
      } else {
        const response = await createBank(formData, bank.postBank);
        if (response?.success) {
          showToastMessage(response.message || "Bank created successfully", "success");
          refetch();
          setOpenForm(false);
          resetForm();
        } else {
          showToastMessage(response?.message ?? "Create failed", "error");
        }
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e == "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: "",
      bank_code: "",
      short_name: "",
      is_active: true,
    });
    setEditMode(false);
    setSelectedId(null);
  };

  const handleEdit = (row: IBank) => {
    setFormData({
      bank_name: row.bank_name,
      bank_code: row.bank_code || "",
      short_name: row.short_name || "",
      is_active: row.is_active ?? true,
    });
    setSelectedId(row.id || null);
    setEditMode(true);
    setOpenForm(true);
  };

  const columns: ITableColumn<IBank>[] = [
    {
      key: "bank_code",
      label: "Bank Code",
      render: (row) => (
        <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
          <HighlightedCell value={row.bank_code || "N/A"} search={filters?.search} />
        </Typography>
      ),
    },
    {
      key: "bank_name",
      label: "Bank Name",
      render: (row) => (
        <Typography variant="body2">
          <HighlightedCell value={row.bank_name} search={filters?.search} />
        </Typography>
      ),
      cellStyle: {
        minWidth: 200,
        maxWidth: 300,
      },
    },
    {
      key: "short_name",
      label: "Short Name",
      render: (row) => (
        <Typography variant="body2">
          <HighlightedCell value={row.short_name || "N/A"} search={filters?.search} />
        </Typography>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => {
        const label = row.is_active ? "Active" : "Inactive";
        return (
          <Box sx={classes.getStatusTypeBadge(row.is_active ? "active" : "inactive")}>
            <HighlightedCell value={label} search={filters?.is_active || filters?.search} />
          </Box>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <>
          <IconButton size="small" color="primary" onClick={() => handleEdit(row)}>
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row.id || null);
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
        title="Banks"
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
          <Typography variant="h6" sx={classes.FileDropStyle}>
            Filter
          </Typography>
          <Grid container spacing={2} component="div" sx={{ mb: 2, p: 2 }}>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdownBase
                name="is_active"
                label="Status"
                value={filters.is_active}
                options={[{ value: "", label: "All" }, ...activeTypesBanks]}
                onDropdownChange={(e, _name, val) => handleTypeChange("is_active", val as string)}
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
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search Banks"
            />
          </Box>
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => {
              resetForm();
              setOpenForm(true);
            }}
            startIcon={<Plus size={18} />}
          >
            Add New Bank
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
          data={results?.data ?? []}
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
        onClose={() => setOpen(false)}
        title="Delete Bank"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete this bank?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this bank will be permanently
              removed from the database.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      <BBDialog
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          resetForm();
        }}
        title={editMode ? "Edit Bank" : "Add New Bank"}
        maxWidth="sm"
        content={
          <Box sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Bank Name"
                required
                value={formData.bank_name}
                onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                placeholder="Enter bank name"
              />
              <TextField
                fullWidth
                label="Bank Code"
                value={formData.bank_code}
                onChange={(e) => setFormData({ ...formData, bank_code: e.target.value })}
                placeholder="Enter bank code"
                inputProps={{ style: { textTransform: "uppercase" } }}
              />
              <TextField
                fullWidth
                label="Short Name"
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
                placeholder="Enter short name"
              />
              <BBDropdownBase
                name="is_active"
                label="Status"
                value={formData.is_active ? "true" : "false"}
                options={activeTypesBanks}
                onDropdownChange={(e, _name, val) => setFormData({ ...formData, is_active: val === "true" })}
              />
            </Stack>
          </Box>
        }
        onConfirm={handleSubmit}
        confirmText={editMode ? "Update" : "Create"}
        cancelText="Cancel"
      />
    </Box>
  );
}
