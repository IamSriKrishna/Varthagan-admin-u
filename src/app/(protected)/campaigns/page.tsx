"use client";
import { config } from "@/config";
import { campagin } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import useFetch from "@/hooks/useFetch";
import { BBButton, BBDialog, BBDropdownBase, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { ICampaign } from "@/models/ICampaign";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Divider, IconButton, Paper, Stack, Typography } from "@mui/material";
import { PencilLine, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as classes from "../../../styles/listtable.styles";
import { activeTypescategories } from "@/constants/commonConstans";
type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
interface ICampaigns {
  campaigns: ICampaign[];
  pagination: {
    current_page: number;
    has_next: boolean;
    total_campaigns: number;
    total_pages: number;
  };
}
export default function Campaign() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    active: "",
  });
  const {
    data: results,
    refetch,
    loading,
  } = useFetch<ICampaigns>({
    url: `${campagin.getCampagin}?page=${page + 1}&limit=${rowsPerPage}&search=${filters.search}&is_active=${filters.active}`,
    baseUrl: config.campaginDomain,
  });

  const { mutateApi: deleteProduct } = useApi<ApiResponse<null>>("", "DELETE", undefined, config.campaginDomain);

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const deleteUrl = `${campagin.updateCampaginDetails(selectedId)}`;
      const response = await deleteProduct(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "Campaigns deleted successfully", "success");
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
  const columns: ITableColumn<ICampaign>[] = [
    { key: "name", label: "Name" },

    {
      key: "title",
      label: "Title",
    },
    {
      key: "description",
      label: "Description",
      render: (row) => <Box sx={classes.descriptionStyle}>{row.description}</Box>,
      cellStyle: {
        width: 300,
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const label = row.status ? "Active" : "Inactive";
        return (
          <Box sx={classes.getStatusTypeBadge(row.status ? "active" : "inactive")}>
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
          <IconButton size="small" color="primary" onClick={() => router.push(`/campaigns/campaign/${row.id}`)}>
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
    <Box>
      <BBLoader enabled={loading} />
      <BBTitle title="Campaign" />
      <Box
        sx={{
          borderRadius: "10px 10px 0 0",
          boxShadow: "none",
        }}
        component={Paper}
      >
        <Typography variant="h6" sx={classes.FileDropStyle}>
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Box>
            <BBInputBase
              label=""
              name="search"
              value={filters?.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Search Campaign"
            />
          </Box>{" "}
          <BBButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/campaigns/campaign/new")}
            startIcon={<Plus size={18} />}
          >
            Add New Campaign
          </BBButton>
        </Stack>
      </Box>

      <BBTable
        data={results?.campaigns ?? []}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={results?.pagination?.total_campaigns ?? 0}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
      />

      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Campaign"
        content="Are you sure you want to delete this Campaign? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />
    </Box>
  );
}
