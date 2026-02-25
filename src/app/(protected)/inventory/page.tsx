"use client";

import ProductManagement from "@/components/products/ProductManagement";
import { Box } from "@mui/material";

export default function InventoryPage() {
  return (
    <Box sx={{ p: 3 }}>
      <ProductManagement />
    </Box>
  );
}
