"use client";
import { category, products } from "@/constants/apiConstants";
import { activeTypescategories } from "@/constants/commonConstans";
import { productTypes } from "@/constants/productConstans";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBNoImage, BBTable, BBTitle } from "@/lib";
import ImageCarousel from "@/lib/BBImageCarousel/ImageCarousel";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell, { highlightHTMLText } from "@/lib/BBTable/HighlightedCell";
import { IProduct } from "@/models/IProduct";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Collapse, Divider, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Filter, PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import * as classes from "../../../styles/listtable.styles";
import { useDebounce } from "@/hooks/useDebounce";
import { ICategorys } from "@/models/ICategory";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

interface IProducts {
  products: IProduct[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export default function Products() {
  const [page, setPage] = useState(0);
  const [filteropen, setFilterOpen] = useState<boolean>(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    active: "",
    category_ids: "",
  });
  const { data: categoryData } = useFetch<{ data: ICategorys }>({
    url: `${category.getCategory}`,
  });
  const categoryOptions =
    categoryData?.data?.categories?.map((cat) => ({
      label: cat.category_name,
      value: cat.id,
    })) || [];
  const debouncedSearch = useDebounce(filters.search, 500);
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch) {
      params.append("search", debouncedSearch);
    }
    if (filters.category_ids) {
      params.append("category_ids", filters.category_ids);
    }
    if (filters.type && filters.type.trim()) {
      params.append("type", filters.type);
    }
    if (filters.active !== undefined && filters.active !== null && String(filters.active).trim()) {
      params.append("is_active", String(filters.active));
    }
    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);
  const {
    data: results,
    refetch,
    loading,
  } = useFetch<{ data: IProducts }>({
    url: `${products.postProduct}?${queryParams}`,
  });

  const { mutateApi: deleteProduct } = useApi<ApiResponse<null>>("", "DELETE");

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${products.postProduct}/${selectedId}`;
      const response = await deleteProduct(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Product deleted successfully", "success");
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

  const columns: ITableColumn<IProduct>[] = [
    {
      key: "product_name",
      label: "Product Name",
      render: (row) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          {(row.images?.length ?? 0) > 0 ? (
            <Box>
              <ImageCarousel images={row.images!.map((img) => ({ image_url: img.image_url }))} />
            </Box>
          ) : (
            <Box>
              <BBNoImage />
            </Box>
          )}
          <Typography variant="body2">
            <HighlightedCell value={row.product_name} search={filters?.search} />
          </Typography>
        </Stack>
      ),
      cellStyle: {
        minWidth: 200,
        maxWidth: 300,
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
        maxWidth: 300,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },
    {
      key: "list_price",
      label: "Pricing",
      render: (row) => (
        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
          <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                List Amount :
              </Typography>
              <Typography variant="subtitle2" fontWeight="600">
                ₹{row?.list_price}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Deal Amount :
              </Typography>
              <Typography variant="subtitle2" fontWeight="600" color="success.main">
                ₹{row.deal_amount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Discounts :
              </Typography>
              <Typography variant="subtitle2" fontWeight="600" color="error.main">
                {row.product_discount}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              GST :
            </Typography>
            <Typography variant="subtitle2" fontWeight="600" color="error.main">
              {row.gst_percentage}%
            </Typography>
          </Box>
        </Box>
      ),
      cellStyle: {
        Width: 300,
      },
    },
    { key: "max_bb_coins", label: "BB Coins" },
    {
      key: "type",
      label: "Type",
      render: (row) => {
        const label = row.type.charAt(0).toUpperCase() + row.type.slice(1);
        return (
          <Box sx={classes.Badge(row.type)}>
            <HighlightedCell value={label} search={filters?.type || filters?.search} />
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
            <HighlightedCell value={label} search={filters?.active} />
          </Box>
        );
      },
    },

    {
      key: "action",
      label: "Action",
      render: (row) => (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => router.push(`/products/product/${row.id}`)}
            // disabled={!row.is_active}
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            disabled={!row.is_active}
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
        title="Products"
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
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <BBDropdownBase
                name="type"
                label="Product Type"
                value={filters?.type}
                options={[{ value: "", label: "All" }, ...productTypes]}
                onDropdownChange={(e, _name, val) => handleTypeChange("type", val as string)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} component="div">
              <BBDropdownBase
                name="type"
                label="Category Type"
                value={filters?.category_ids}
                options={[{ value: "", label: "All" }, ...categoryOptions]}
                onDropdownChange={(e, _name, val) => handleTypeChange("category_ids", val as string)}
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
              placeholder="Search Product"
            />
          </Box>{" "}
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/products/product/new")}
            startIcon={<Plus size={18} />}
          >
            Add New Product
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
          data={results?.data?.products ?? []}
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
        title="Delete Product"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to delete the product ?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Deactivating the product will make it unavailable for customers, but it will remain in your database.
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
