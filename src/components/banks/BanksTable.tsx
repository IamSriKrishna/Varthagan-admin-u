"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  Chip,
  TablePagination,
  Tooltip,
  IconButton,
  Typography,
  Skeleton,
} from "@mui/material";
import {
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  Landmark,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Bank } from "@/models/bank.model";
import { bankService } from "@/lib/api/bankService";
import { showToastMessage } from "@/utils/toastUtil";

interface BanksTableProps {
  onEdit?: (bank: Bank) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const TH = {
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 600,
  fontSize: "0.7rem",
  color: "#9CA3AF",
  textTransform: "uppercase" as const,
  letterSpacing: "0.8px",
  py: 1.5,
  px: 2.5,
  backgroundColor: "#FAFBFC",
  borderBottom: "1px solid #F0F1F5",
  whiteSpace: "nowrap" as const,
};

const TD = {
  px: 2.5,
  py: 1.5,
  borderColor: "#F3F4F8",
  fontFamily: "'DM Sans', sans-serif",
};

/** Skeleton row while loading */
function SkeletonRow() {
  return (
    <TableRow>
      {[110, 150, 120, 100, 100, 70, 80].map((w, i) => (
        <TableCell key={i} sx={{ ...TD, borderColor: "#F3F4F8" }}>
          <Skeleton variant="rounded" width={w} height={16} sx={{ borderRadius: 1 }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function BanksTable({
  onEdit,
  onRefresh,
  refreshTrigger = 0,
}: BanksTableProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, [page, pageSize, refreshTrigger]);

  const fetchBanks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bankService.getBanks(page + 1, pageSize);
      // Parse nested response structure: response.data.banks
      const banksData = Array.isArray(response.data?.banks) ? response.data.banks : [];
      setBanks(banksData);
      setTotalCount(response.data?.total || 0);
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to fetch banks";
      setError(errorMessage);
      showToastMessage(errorMessage, "error");
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bankId: number) => {
    try {
      setDeleting(true);
      await bankService.deleteBank(bankId);
      showToastMessage("Bank deleted successfully", "success");
      setDeleteConfirm(null);
      fetchBanks();
    } catch (err: any) {
      const errorMessage = err?.message || err?.response?.data?.message || "Failed to delete bank";
      showToastMessage(errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (bankId: number) => {
    const item = Array.isArray(banks) ? banks.find((b) => b.id === bankId) : undefined;
    setDeleteConfirm({ id: bankId, name: item?.bank_name ?? "this bank" });
  };

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              startIcon={<RefreshCw size={13} />}
              onClick={fetchBanks}
              sx={{ fontFamily: "'DM Sans', sans-serif", textTransform: "none", fontSize: "0.8125rem" }}
            >
              Retry
            </Button>
          }
          sx={{
            mb: 2.5,
            borderRadius: "12px",
            border: "1px solid #FECACA",
            backgroundColor: "#FFF5F5",
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {error}
        </Alert>
      )}

      {/* ── Table Card ── */}
      <Box
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #E9ECF2",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <TableContainer>
          <Table>
            {/* ── HEAD ── */}
            <TableHead>
              <TableRow>
                <TableCell sx={TH}>Bank Name</TableCell>
                <TableCell sx={TH}>Address</TableCell>
                <TableCell sx={TH}>City</TableCell>
                <TableCell sx={TH}>State</TableCell>
                <TableCell sx={TH}>Postal Code</TableCell>
                <TableCell sx={{ ...TH, textAlign: "center" }}>Status</TableCell>
                <TableCell sx={{ ...TH, textAlign: "right" }}></TableCell>
              </TableRow>
            </TableHead>

            {/* ── BODY ── */}
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !Array.isArray(banks) || banks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ border: 0, py: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        py: 10,
                        gap: 1.5,
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: "16px",
                          backgroundColor: "#F3F4F8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 0.5,
                        }}
                      >
                        <Landmark size={28} color="#CBD5E1" strokeWidth={1.5} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        No banks found
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "#9CA3AF",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Add your first bank to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                banks.map((bank) => (
                  <TableRow
                    key={bank.id}
                    sx={{
                      cursor: "default",
                      "&:last-child td": { borderBottom: 0 },
                      "&:hover": {
                        backgroundColor: "#F8F9FE",
                        "& .action-btns": { opacity: 1 },
                      },
                      transition: "background 0.12s ease",
                    }}
                  >
                    {/* Bank Name */}
                    <TableCell sx={TD}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "#111827",
                          fontFamily: "'DM Sans', sans-serif",
                          lineHeight: 1.3,
                        }}
                      >
                        {bank.bank_name}
                      </Typography>
                    </TableCell>

                    {/* Address */}
                    <TableCell sx={TD}>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "#6B7280",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {bank.address || "—"}
                      </Typography>
                    </TableCell>

                    {/* City */}
                    <TableCell sx={TD}>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "#1F2937",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {bank.city || "—"}
                      </Typography>
                    </TableCell>

                    {/* State */}
                    <TableCell sx={TD}>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 500,
                          color: "#1F2937",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {bank.state || "—"}
                      </Typography>
                    </TableCell>

                    {/* Postal Code */}
                    <TableCell sx={TD}>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "#1F2937",
                          fontFamily: "'DM Mono', 'Fira Mono', monospace",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {bank.postal_code || "—"}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ ...TD, textAlign: "center" }}>
                      <Chip
                        label={bank.is_active ? "Active" : "Inactive"}
                        size="small"
                        sx={{
                          backgroundColor: bank.is_active ? "#DCFCE7" : "#FEE2E2",
                          color: bank.is_active ? "#166534" : "#991B1B",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          fontFamily: "'DM Sans', sans-serif",
                          border: `1px solid ${bank.is_active ? "#86EFAC" : "#FECACA"}`,
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ ...TD, textAlign: "right" }}>
                      <Box className="action-btns" sx={{ display: "flex", gap: 0.5, opacity: 0.7, transition: "opacity 0.2s ease" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => onEdit?.(bank)}
                            sx={{
                              color: "#6366F1",
                              "&:hover": { backgroundColor: "#EEF2FF" },
                            }}
                          >
                            <EditIcon size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(bank.id)}
                            sx={{
                              color: "#EF4444",
                              "&:hover": { backgroundColor: "#FEE2E2" },
                            }}
                          >
                            <DeleteIcon size={16} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {!loading && Array.isArray(banks) && banks.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setPageSize(parseInt(event.target.value, 10));
              setPage(0);
            }}
            sx={{
              "& .MuiTablePagination-root": {
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <Box
          sx={{
            height: "4px",
            background: "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
          }}
        />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={24} color="#DC2626" strokeWidth={1.5} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#1F2937",
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 1,
                }}
              >
                Delete Bank
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 1,
                }}
              >
                Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: "#9CA3AF",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                This action cannot be undone. All data associated with this bank will be permanently removed.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        {/* Dialog Actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #F3F4F8",
            display: "flex",
            gap: 1.5,
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setDeleteConfirm(null)}
            disabled={deleting}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
            disabled={deleting}
            sx={{
              borderRadius: "10px",
              textTransform: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: "white" }} /> : "Delete"}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
