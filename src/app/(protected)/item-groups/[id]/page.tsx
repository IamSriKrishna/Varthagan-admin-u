"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useItemGroups } from "@/hooks/useItemGroups";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ArrowLeft, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import ItemGroupDrawer from "@/components/itemGroups/ItemGroupDrawer";
import { ItemGroup } from "@/models/item-group.model";

export default function ItemGroupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [itemGroup, setItemGroup] = useState<ItemGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  const { getItemGroup, updateItemGroup, refetch } = useItemGroups();

  useEffect(() => {
    const fetchItemGroup = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getItemGroup(id);
        setItemGroup(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load item group");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItemGroup();
    }
  }, [id, getItemGroup]);

  const handleSave = async (payload: any) => {
    try {
      await updateItemGroup(id, payload);
      const updated = await getItemGroup(id);
      setItemGroup(updated);
      setEditDrawerOpen(false);
    } catch (err) {
      console.error("Failed to update item group:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !itemGroup) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">
          {error || "Item group not found"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 3 }}>
        <Box>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.back()}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            {itemGroup.name}
          </Typography>
          <Chip
            label={itemGroup.is_active ? "Active" : "Inactive"}
            color={itemGroup.is_active ? "success" : "default"}
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Edit size={18} />}
          onClick={() => setEditDrawerOpen(true)}
        >
          Edit
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Description */}
      {itemGroup.description && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Description
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {itemGroup.description}
          </Typography>
        </Paper>
      )}

      {/* Metadata */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              CREATED
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {itemGroup.created_at
                ? new Date(itemGroup.created_at).toLocaleDateString()
                : "-"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              LAST UPDATED
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {itemGroup.updated_at
                ? new Date(itemGroup.updated_at).toLocaleDateString()
                : "-"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              COMPONENTS
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {itemGroup.components?.length || 0}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Components Table */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Bill of Materials (BOM)
        </Typography>

        {itemGroup.components && itemGroup.components.length > 0 ? (
          <Paper sx={{ overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Variant SKU</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell>Variant Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itemGroup.components.map((component, index) => (
                  <TableRow key={index} sx={{ "&:nth-of-type(odd)": { bgcolor: "#fafafa" } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {component.item?.name || component.item_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {component.item_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {component.item?.sku || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {component.variant_sku || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {component.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {component.variant_details && Object.keys(component.variant_details).length > 0 ? (
                        <Typography variant="caption" component="div">
                          {Object.entries(component.variant_details).map(([key, value]) => (
                            <Box key={key} sx={{ display: "flex", gap: 1 }}>
                              <span>{key}:</span>
                              <strong>{String(value)}</strong>
                            </Box>
                          ))}
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Alert severity="info">No components defined for this item group.</Alert>
        )}
      </Box>

      {/* Edit Drawer */}
      <ItemGroupDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        itemGroup={itemGroup}
        onSave={handleSave}
      />
    </Box>
  );
}
