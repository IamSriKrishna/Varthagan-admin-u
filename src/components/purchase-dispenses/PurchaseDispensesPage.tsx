"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Avatar, Box, Chip, IconButton, MenuItem, Paper, TextField, Tooltip, Typography } from "@mui/material";
import { Boxes, Eye, PackageCheck, Plus, RefreshCw, Scale, Search } from "lucide-react";

import { BBButton, BBInputBase, BBLoader, BBTable } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import { PurchaseDispense } from "@/models/purchaseDispense.model";
import { PurchaseOrder } from "@/models/purchaseOrder.model";
import { PurchaseClaim } from "@/models/purchaseClaim.model";
import { purchaseDispenseService } from "@/lib/api/purchaseDispenseService";
import { showToastMessage } from "@/utils/toastUtil";

export default function PurchaseDispensesPage() {
  const router = useRouter();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);

  const [claims, setClaims] = useState<PurchaseClaim[]>([]);

  const [dispenses, setDispenses] = useState<PurchaseDispense[]>([]);

  const [purchaseOrderId, setPurchaseOrderId] = useState("");

  const [claimId, setClaimId] = useState("");

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    void loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);

      const result = await purchaseDispenseService.getPurchaseOrders();

      setPurchaseOrders(result);

      if (result.length > 0) {
        setPurchaseOrderId(result[0].id);

        await loadClaims(result[0].id);
      }
    } catch (error: unknown) {
      showToastMessage(getErrorMessage(error, "Failed to load purchase orders"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async (poId: string) => {
    if (!poId) {
      setClaims([]);
      setClaimId("");
      setDispenses([]);
      return;
    }

    try {
      setLoading(true);

      const response = await purchaseDispenseService.getClaimsByPurchaseOrder(poId);

      setClaims(response.data ?? []);
      setClaimId("");
      setDispenses([]);
    } catch (error: unknown) {
      showToastMessage(getErrorMessage(error, "Failed to load claims"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDispenses = async (selectedClaimId: string) => {
    if (!selectedClaimId) {
      setDispenses([]);
      return;
    }

    try {
      setLoading(true);

      const response = await purchaseDispenseService.getDispensesByClaim(selectedClaimId);

      setDispenses(response.data ?? []);
      setPage(0);
    } catch (error: unknown) {
      showToastMessage(getErrorMessage(error, "Failed to load purchase dispenses"), "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return dispenses;
    }

    return dispenses.filter((item) =>
      [item.product_name, item.notes, item.unit, item.base_unit].some((field) =>
        String(field || "")
          .toLowerCase()
          .includes(value),
      ),
    );
  }, [dispenses, search]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;

    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  const columns: ITableColumn<PurchaseDispense>[] = [
    {
      key: "product_name",
      label: "Product",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: row.is_raw_material ? "#ecfeff" : "#f0f4ff",
              color: row.is_raw_material ? "#0891b2" : "#4f63d2",
              border: "1px solid #e5e7eb",
            }}
          >
            {row.is_raw_material ? <Scale size={16} /> : <Boxes size={16} />}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: "0.82rem",
                fontWeight: 700,
              }}
            >
              {row.product_name}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.7rem",
                color: "#9ca3af",
              }}
            >
              {row.is_raw_material ? "Raw material" : "Variant product"}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "quantity",
      label: "Received",
      render: (row) => (
        <Typography
          sx={{
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            fontSize: "0.8rem",
          }}
        >
          {row.quantity.toLocaleString()} {row.unit}
        </Typography>
      ),
    },
    {
      key: "base_quantity",
      label: "Base Quantity",
      render: (row) => (
        <Chip
          label={`${row.base_quantity.toLocaleString()} ${row.base_unit}`}
          size="small"
          sx={{
            bgcolor: "#ecfdf5",
            color: "#047857",
            border: "1px solid #a7f3d0",
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      key: "dispense_date",
      label: "Date",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
          }}
        >
          {dayjs(row.dispense_date).format("DD MMM YYYY")}
        </Typography>
      ),
    },
    {
      key: "notes",
      label: "Notes",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: "#6b7280",
            maxWidth: 260,
          }}
        >
          {row.notes || "—"}
        </Typography>
      ),
    },
    {
      key: "id",
      label: "",
      render: (row) => (
        <Tooltip title="View dispense">
          <IconButton
            size="small"
            onClick={() => router.push(`/purchase-dispenses/dispense/${row.id}`)}
            sx={{
              color: "#0ea5e9",
              bgcolor: "#f0f9ff",
            }}
          >
            <Eye size={15} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      <BBLoader enabled={loading} />

      <Box
        sx={{
          px: 3,
          py: 2.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f0f0f5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "13px",
              background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(14,165,233,0.24)",
            }}
          >
            <PackageCheck size={22} color="white" />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "#1a1d2e",
              }}
            >
              Purchase Dispenses
            </Typography>

            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#9ca3af",
              }}
            >
              Vendor replacement stock receipt history
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.25,
          }}
        >
          <IconButton
            onClick={() => void loadDispenses(claimId)}
            disabled={!claimId}
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
            }}
          >
            <RefreshCw size={17} />
          </IconButton>

          <BBButton
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => router.push("/purchase-dispenses/dispense/new")}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
            }}
          >
            New Dispense
          </BBButton>
        </Box>
      </Box>

      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3,
          mt: 3,
          p: 2.5,
          border: "1px solid #eeeff5",
          borderRadius: "14px 14px 0 0",
          display: "flex",
          flexDirection: {
            xs: "column",
            md: "row",
          },
          gap: 1.5,
        }}
      >
        <TextField
          select
          label="Purchase Order"
          value={purchaseOrderId}
          onChange={(event) => {
            const value = event.target.value;

            setPurchaseOrderId(value);

            void loadClaims(value);
          }}
          sx={{
            minWidth: 280,
            ...fieldSx,
          }}
        >
          {purchaseOrders.map((po) => (
            <MenuItem key={po.id} value={po.id}>
              {po.purchase_order_no}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Purchase Claim"
          value={claimId}
          disabled={!purchaseOrderId}
          onChange={(event) => {
            const value = event.target.value;

            setClaimId(value);

            void loadDispenses(value);
          }}
          sx={{
            minWidth: 260,
            ...fieldSx,
          }}
        >
          {claims.map((claim) => (
            <MenuItem key={claim.id} value={claim.id}>
              {claim.claim_number}
            </MenuItem>
          ))}
        </TextField>

        <Box
          sx={{
            position: "relative",
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 1,
              color: "#9ca3af",
            }}
          >
            <Search size={15} />
          </Box>

          <BBInputBase
            label=""
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product or notes..."
            sx={{ pl: 4.5 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          mx: 3,
          mb: 3,
          border: "1px solid #eeeff5",
          borderTop: "none",
          borderRadius: "0 0 14px 14px",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <BBTable
          data={paginatedRows}
          columns={columns}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={filteredRows.length}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => {
            setRowsPerPage(value);
            setPage(0);
          }}
        />
      </Box>
    </Box>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontFamily: "'DM Sans', sans-serif",
  },
};
