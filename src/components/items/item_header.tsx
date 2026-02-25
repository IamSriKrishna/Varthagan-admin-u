"use client";

import { Box, Button, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import { ChevronDown, Grid3x3, List, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ItemsHeaderProps {
  viewMode: "list" | "grid";
  onViewModeChange: (mode: "list" | "grid") => void;
}

export default function ItemsHeader({ viewMode, onViewModeChange }: ItemsHeaderProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
      {/* Left side - Title with dropdown */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Active Items
        </Typography>
        <IconButton size="small" onClick={(e) => setFilterAnchor(e.currentTarget)}>
          <ChevronDown size={20} />
        </IconButton>

        <Menu anchorEl={filterAnchor} open={Boolean(filterAnchor)} onClose={() => setFilterAnchor(null)}>
          <MenuItem onClick={() => setFilterAnchor(null)}>Active Items</MenuItem>
          <MenuItem onClick={() => setFilterAnchor(null)}>All Items</MenuItem>
          <MenuItem onClick={() => setFilterAnchor(null)}>Inactive Items</MenuItem>
        </Menu>
      </Box>

      {/* Right side - Actions */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* View Mode Toggle */}
        <Box sx={{ display: "flex", border: "1px solid #e0e0e0", borderRadius: 1 }}>
          <IconButton
            size="small"
            onClick={() => onViewModeChange("list")}
            sx={{
              borderRadius: 0,
              backgroundColor: viewMode === "list" ? "#f5f5f5" : "transparent",
            }}
          >
            <List size={20} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onViewModeChange("grid")}
            sx={{
              borderRadius: 0,
              backgroundColor: viewMode === "grid" ? "#f5f5f5" : "transparent",
            }}
          >
            <Grid3x3 size={20} />
          </IconButton>
        </Box>

        {/* New Button */}
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => router.push("/items/new")}
          sx={{ textTransform: "none" }}
        >
          New
        </Button>

        {/* More Options */}
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVertical size={20} />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => setAnchorEl(null)}>Import Items</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Export Items</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Print</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
