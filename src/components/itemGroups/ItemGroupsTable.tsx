"use client";

import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useItemGroups } from "@/hooks/useItemGroups";
import { ItemGroup } from "@/models/item-group.model";
import BBTable, { ITableColumn } from "@/lib/BBTable/BBTable";
import { Package, Trash2, Edit, Plus } from "lucide-react";
import ItemGroupDrawer from "./ItemGroupDrawer";

export default function ItemGroupsTable() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItemGroup, setSelectedItemGroup] = useState<ItemGroup | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, refetch, createItemGroup, updateItemGroup, deleteItemGroup } =
    useItemGroups({
      page: page + 1,
      limit: rowsPerPage,
      search: searchText,
    });

  const handleOpenDrawer = (itemGroup?: ItemGroup) => {
    setSelectedItemGroup(itemGroup);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedItemGroup(undefined);
  };

  const handleSave = async (payload: any) => {
    if (selectedItemGroup) {
      await updateItemGroup(selectedItemGroup.id, payload);
    } else {
      await createItemGroup(payload);
    }
    refetch();
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      setDeleting(true);
      await deleteItemGroup(deletingId);
      refetch();
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      console.error("Failed to delete item group:", err);
    } finally {
      setDeleting(false);
    }
  };

  const columns: ITableColumn<ItemGroup>[] = [
    {
      key: "name",
      label: "NAME",
      cellStyle: { fontWeight: 500 },
      render: (row: ItemGroup) => (
        <Typography
          variant="body2"
          sx={{
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => handleOpenDrawer(row)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: "description",
      label: "DESCRIPTION",
      render: (row: ItemGroup) => (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 300,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.description || "-"}
        </Typography>
      ),
    },
    {
      key: "is_active",
      label: "STATUS",
      render: (row: ItemGroup) => (
        <Chip
          label={row.is_active ? "Active" : "Inactive"}
          size="small"
          color={row.is_active ? "success" : "default"}
          variant={row.is_active ? "filled" : "outlined"}
        />
      ),
    },
    {
      key: "components",
      label: "COMPONENTS",
      render: (row: ItemGroup) => (
        <Typography variant="body2" align="center">
          {row.components?.length || 0}
        </Typography>
      ),
    },
    {
      key: "created_at",
      label: "CREATED",
      render: (row: ItemGroup) => (
        <Typography variant="body2" color="text.secondary">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "-"}
        </Typography>
      ),
    },
    {
      key: "action",
      label: "ACTIONS",
      render: (row: ItemGroup) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleOpenDrawer(row)}
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

  const renderAccordionContent = (row: ItemGroup) => {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
          Components ({row.components?.length || 0})
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {row.components?.map((component, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                p: 1.5,
                bgcolor: "background.paper",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {component.item?.name || component.item_id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  SKU: {component.item?.sku || "-"} | Variant: {component.variant_sku || "-"} | Qty: {component.quantity}
                </Typography>
                {component.variant_details && Object.keys(component.variant_details).length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Details: {JSON.stringify(component.variant_details)}
                  </Typography>
                )}
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" fontWeight={500}>
                  Qty: {component.quantity}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load item groups. Please try again.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with Search */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search item groups..."
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchText(e.target.value);
              setPage(0);
            }}
            sx={{ width: "100%", maxWidth: 300 }}
          />
        </Box>
        <Typography variant="h5" fontWeight={600} sx={{ flex: 1, textAlign: "center" }}>
          Item Groups (BOM)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} strokeWidth={2.5} />}
          onClick={() => handleOpenDrawer()}
          sx={{
            bgcolor: "#6366f1",
            color: "white",
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontWeight: 500,
            "&:hover": {
              bgcolor: "#4f46e5",
            },
          }}
        >
          New Item Group
        </Button>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Alert severity="info">No item groups found. Create one to get started.</Alert>
      ) : (
        <BBTable<ItemGroup>
          data={data}
          columns={columns}
          primaryKey="id"
          pagination={true}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={data.length}
          onPageChange={(newPage: number) => setPage(newPage)}
          onRowsPerPageChange={(newRowsPerPage: number) => {
            setRowsPerPage(newRowsPerPage);
            setPage(0);
          }}
          renderAccordionContent={(row: ItemGroup) => renderAccordionContent(row)}
          higlightText={searchText}
        />
      )}

      {/* Drawer */}
      <ItemGroupDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        itemGroup={selectedItemGroup}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Item Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item group? This action cannot be undone.
          </Typography>
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
