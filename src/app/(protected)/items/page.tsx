"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { Plus, Trash2, Edit, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import { Item } from "@/models/item.model";
import { itemService } from "@/services/itemService";

export default function ItemsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [page, rowsPerPage, search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await itemService.getItems(page + 1, rowsPerPage, search);
      setItems(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      await itemService.deleteItem(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const columns: ITableColumn<Item>[] = [
    {
      key: "name",
      label: "NAME",
      cellStyle: { fontWeight: 500 },
      render: (row: Item) => (
        <Box
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => router.push(`/items/${row.id}`)}
        >
          {row.name}
        </Box>
      ),
    },
    {
      key: "type",
      label: "TYPE",
      render: (row: Item) => (
        <Chip
          label={row.type?.toUpperCase()}
          variant={row.type === "goods" ? "filled" : "outlined"}
          size="small"
          color={row.type === "goods" ? "primary" : "secondary"}
        />
      ),
    },
    {
      key: "id",
      label: "SKU",
      render: (row: Item) => <Typography variant="body2">{row.item_details?.sku || "-"}</Typography>,
    },
    {
      key: "item_details",
      label: "STRUCTURE",
      render: (row: Item) => (
        <Chip label={row.item_details?.structure === "variants" ? "Variants" : "Single"} size="small" />
      ),
    },
    {
      key: "sales_info",
      label: "VARIANTS",
      render: (row: Item) =>
        row.item_details?.structure === "variants" ? (
          <Typography variant="body2">{row.item_details?.variants?.length || 0}</Typography>
        ) : (
          "-"
        ),
    },
    {
      key: "action",
      label: "ACTIONS",
      render: (row: Item) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => router.push(`/items/${row.id}`)}
            title="View"
          >
            <Eye size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => router.push(`/items/${row.id}/edit`)}
            title="Edit"
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(row.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      ),
    },
  ];
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>
          Items
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => router.push("/items/create")}
        >
          Create Item
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Search items by name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          disabled={loading}
        />
      </Paper>

      {/* Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : items.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No items found
          </Alert>
        ) : (
          <BBTable
            columns={columns}
            data={items}
            pagination={true}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={total}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRowsPerPage) => {
              setRowsPerPage(newRowsPerPage);
              setPage(0);
            }}
          />
        )}
      </Paper>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Item</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this item? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}