"use client";
import CategoryForm from "@/components/category/CategoryForm/CategoryForm";
import { category } from "@/constants/apiConstants";
import { activeTypescategories, bbEnabled } from "@/constants/commonConstans";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBNoImage, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell, { highlightHTMLText } from "@/lib/BBTable/HighlightedCell";
import { ICategory, ICategorys } from "@/models/ICategory";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Filter, PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as classes from "../../../styles/listtable.styles";
import { useDebounce } from "@/hooks/useDebounce";
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export default function Categorys() {
  const [page, setPage] = useState(0);
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    isbb_coins: "",
    active: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch.trim()) {
      params.append("search", debouncedSearch.trim());
    }
    if (filters.active !== undefined && filters.active !== null && String(filters.active).trim()) {
      params.append("is_active", String(filters.active).trim());
    }
    if (filters.isbb_coins !== undefined && filters.isbb_coins !== null && String(filters.isbb_coins).trim()) {
      params.append("isbb_coins", String(filters.isbb_coins).trim());
    }
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);

  const {
    data: results,
    refetch,
    loading,
  } = useFetch<{ data: ICategorys }>({
    url: `${category.getCategory}?${queryParams}`,
  });
  const { mutateApi: deleteProduct } = useApi<ApiResponse<null>>("", "DELETE");

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${category.postCategory}/${selectedId}`;
      const response = await deleteProduct(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Category deleted successfully", "success");
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

  const columns: ITableColumn<ICategory>[] = [
    {
      key: "category_name",
      label: "Category Name",
      render: (row) => {
        const image = (row.images || []).find((img) => img.image_type === "image") || null;

        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            {image ? (
              <Box
                component="img"
                src={image.image_url}
                alt="Category"
                sx={{ width: 50, height: 50, borderRadius: 1, objectFit: "cover" }}
              />
            ) : (
              <Box>
                <BBNoImage />
              </Box>
            )}

            <Typography variant="body2" noWrap sx={{ textTransform: "capitalize" }}>
              <HighlightedCell value={row.category_name} search={filters?.search} />
            </Typography>
          </Stack>
        );
      },
      cellStyle: {
        minWidth: 150,
        maxWidth: 200,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },

    {
      key: "description",
      label: "Description",
      render: (row) => (
        <Box
          sx={classes.descriptionStyle}
          dangerouslySetInnerHTML={{ __html: highlightHTMLText(row.description, filters?.search ?? "") }}
        />
      ),
      cellStyle: {
        minWidth: 300,
        maxWidth: 400,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },
    {
      key: "is_bb_coins_enabled",
      label: "Coin",
      render: (row) => {
        const label = row.is_bb_coins_enabled ? "Yes" : "No";
        return (
          <Box sx={classes.getStatusTypeBadge(row.is_bb_coins_enabled ? "active" : "inactive")}>
            <HighlightedCell value={label} search={filters?.search} />
          </Box>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => {
        const label = row.is_active ? "Active" : "Inactive";
        return (
          <Box sx={classes.getStatusTypeBadge(row.is_active ? "active" : "inactive")}>
            <HighlightedCell value={label} search={filters?.active || filters?.search} />
          </Box>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <>
          <IconButton size="small" color="primary" onClick={() => router.push(`/categories/category/${row.id}`)}>
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setSelectedId(row.id);
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
        title="Category"
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
                name="isbb_coins"
                label="Coin"
                value={filters?.isbb_coins}
                options={[{ value: "", label: "All" }, ...bbEnabled]}
                onDropdownChange={(e, _name, val) => handleTypeChange("isbb_coins", val as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} component="div">
              <BBDropdownBase
                name="active"
                label="Status"
                value={filters.active}
                options={[{ value: "", label: "All" }, ...activeTypescategories]}
                onDropdownChange={(e, _name, val) => handleTypeChange("active", val as string)}
              />
            </Grid>
          </Grid>{" "}
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
              placeholder="Search Category"
            />
          </Box>{" "}
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenForm(true);
            }}
            startIcon={<Plus size={18} />}
          >
            Add New Category
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
          data={results?.data?.categories ?? []}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={results?.data?.total ?? 0}
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
        title="Delete Category"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete the category?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this category, including products
              or subcategories, will be permanently removed from the database.
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
        onClose={() => setOpenForm(false)}
        title="Add New Category"
        maxWidth="md"
        hideActions={true}
        content={<CategoryForm setOpen={setOpenForm} onSuccess={refetch} />}
      />
    </Box>
  );
}
