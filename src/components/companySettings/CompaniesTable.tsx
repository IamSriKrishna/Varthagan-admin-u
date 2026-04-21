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
  Chip,
  TablePagination,
  Tooltip,
  IconButton,
  Typography,
  Avatar,
  Skeleton,
} from "@mui/material";
import {
  Eye as EyeIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  Building2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { CompanyData, companyApi } from "@/lib/api/companyApi";
import CompanyDetailsModal from "./CompanyDetailsModal";

interface CompaniesTableProps {
  onEdit?: (company: CompanyData) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

/** Stable avatar color from company name */
const AVATAR_PALETTES = [
  { bg: "#EEF2FF", text: "#4338CA", ring: "#C7D2FE" }, // indigo
  { bg: "#F0FDF4", text: "#15803D", ring: "#BBF7D0" }, // green
  { bg: "#FFF7ED", text: "#C2410C", ring: "#FED7AA" }, // orange
  { bg: "#FDF4FF", text: "#9333EA", ring: "#E9D5FF" }, // purple
  { bg: "#EFF6FF", text: "#1D4ED8", ring: "#BFDBFE" }, // blue
  { bg: "#FFF1F2", text: "#BE123C", ring: "#FECDD3" }, // rose
  { bg: "#F0FDFA", text: "#0F766E", ring: "#99F6E4" }, // teal
];

function getAvatarStyle(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTES[Math.abs(h) % AVATAR_PALETTES.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
      {[130, 90, 110, 120, 90, 60, 80].map((w, i) => (
        <TableCell key={i} sx={{ ...TD, borderColor: "#F3F4F8" }}>
          <Skeleton variant="rounded" width={w} height={16} sx={{ borderRadius: 1 }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function CompaniesTable({
  onEdit,
  onRefresh,
  refreshTrigger = 0,
}: CompaniesTableProps) {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompanyData, setSelectedCompanyData] = useState<CompanyData | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize, refreshTrigger]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.getCompaniesList(page + 1, pageSize);
      setCompanies(response.data);
      setTotalCount(response.total_count);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId: number) => {
    try {
      setDeleting(true);
      await companyApi.deleteCompany(companyId);
      setDeleteConfirm(null);
      fetchCompanies();
    } catch (err: any) {
      alert(err.message || err.response?.data?.error || "Failed to delete company");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewClick = (company: CompanyData) => {
    setSelectedCompanyData(company);
    setDetailsOpen(true);
  };

  const handleEditClick = (company: CompanyData) => {
    setDetailsOpen(false);
    onEdit?.(company);
  };

  const handleDeleteClick = (companyId: number) => {
    setDetailsOpen(false);
    const item = companies.find((c) => c.company.id === companyId);
    setDeleteConfirm({ id: companyId, name: item?.company.company_name ?? "this company" });
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
              onClick={fetchCompanies}
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
                <TableCell sx={TH}>Company</TableCell>
                <TableCell sx={TH}>Business Type</TableCell>
                <TableCell sx={TH}>GST / PAN</TableCell>
                <TableCell sx={TH}>Contact</TableCell>
                <TableCell sx={TH}>Location</TableCell>
                <TableCell sx={{ ...TH, textAlign: "center" }}>Status</TableCell>
                <TableCell sx={{ ...TH, textAlign: "right" }}></TableCell>
              </TableRow>
            </TableHead>

            {/* ── BODY ── */}
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : companies.length === 0 ? (
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
                        <Building2 size={28} color="#CBD5E1" strokeWidth={1.5} />
                      </Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          color: "#374151",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        No companies found
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.8125rem",
                          color: "#9CA3AF",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Add your first company to get started
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((item) => {
                  const avatarStyle = getAvatarStyle(item.company.company_name);
                  const initials = getInitials(item.company.company_name);

                  return (
                    <TableRow
                      key={item.company.id}
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
                      {/* Company */}
                      <TableCell sx={TD}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "10px",
                              backgroundColor: avatarStyle.bg,
                              color: avatarStyle.text,
                              border: `1.5px solid ${avatarStyle.ring}`,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              fontFamily: "'DM Sans', sans-serif",
                              flexShrink: 0,
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: "#111827",
                                fontFamily: "'DM Sans', sans-serif",
                                lineHeight: 1.3,
                              }}
                            >
                              {item.company.company_name}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Business Type */}
                      <TableCell sx={TD}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            px: 1.25,
                            py: 0.4,
                            borderRadius: "6px",
                            backgroundColor: "#EFF1FE",
                            border: "1px solid #DDE1FA",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: "#4338CA",
                              fontFamily: "'DM Sans', sans-serif",
                              letterSpacing: "0.1px",
                            }}
                          >
                            {item.company.business_type?.type_name || "—"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* GST / PAN */}
                      <TableCell sx={TD}>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "0.8125rem",
                              fontWeight: 600,
                              color: "#1F2937",
                              fontFamily: "'DM Mono', 'Fira Mono', monospace",
                              letterSpacing: "0.3px",
                              lineHeight: 1.4,
                            }}
                          >
                            {item.company.gst_number || (
                              <span style={{ color: "#D1D5DB", fontFamily: "inherit" }}>—</span>
                            )}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: "0.74rem",
                              color: "#9CA3AF",
                              fontFamily: "'DM Mono', 'Fira Mono', monospace",
                              letterSpacing: "0.3px",
                              mt: 0.25,
                            }}
                          >
                            {item.company.pan_number || (
                              <span style={{ color: "#D1D5DB" }}>—</span>
                            )}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Contact */}
                      <TableCell sx={TD}>
                        <Typography
                          sx={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "#1F2937",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {item.contact.mobile}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "#6B7280",
                            fontFamily: "'DM Sans', sans-serif",
                            mt: 0.25,
                          }}
                        >
                          {item.contact.email}
                        </Typography>
                      </TableCell>

                      {/* Location */}
                      <TableCell sx={TD}>
                        <Typography
                          sx={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "#1F2937",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {item.address.city}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "#9CA3AF",
                            fontFamily: "'DM Sans', sans-serif",
                            mt: 0.25,
                          }}
                        >
                          {item.address.state?.state_name}, {item.address.country?.country_code}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={TD}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.6,
                            px: 1.25,
                            py: 0.45,
                            borderRadius: "20px",
                            backgroundColor: "#F0FDF4",
                            border: "1px solid #D1FAE5",
                          }}
                        >
                          <Box
                            sx={{
                              width: 5.5,
                              height: 5.5,
                              borderRadius: "50%",
                              backgroundColor: "#22C55E",
                              boxShadow: "0 0 0 2.5px rgba(34,197,94,0.2)",
                            }}
                          />
                          <Typography
                            sx={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "#16A34A",
                              fontFamily: "'DM Sans', sans-serif",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                            }}
                          >
                            Active
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ ...TD, pr: 2 }}>
                        <Box
                          className="action-btns"
                          sx={{
                            display: "flex",
                            gap: 0.5,
                            justifyContent: "flex-end",
                            opacity: 0,
                            transition: "opacity 0.12s ease",
                          }}
                        >
                          <Tooltip title="View" arrow placement="top"
                            componentsProps={{ tooltip: { sx: { fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" } } }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleViewClick(item)}
                              sx={{
                                width: 30, height: 30, borderRadius: "8px",
                                color: "#6366F1",
                                "&:hover": { backgroundColor: "#EEF2FF" },
                                transition: "background 0.12s",
                              }}
                            >
                              <EyeIcon size={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit" arrow placement="top"
                            componentsProps={{ tooltip: { sx: { fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" } } }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleEditClick(item)}
                              sx={{
                                width: 30, height: 30, borderRadius: "8px",
                                color: "#059669",
                                "&:hover": { backgroundColor: "#ECFDF5" },
                                transition: "background 0.12s",
                              }}
                            >
                              <EditIcon size={15} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete" arrow placement="top"
                            componentsProps={{ tooltip: { sx: { fontSize: "0.75rem", fontFamily: "'DM Sans', sans-serif" } } }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                setDeleteConfirm({
                                  id: item.company.id,
                                  name: item.company.company_name,
                                })
                              }
                              sx={{
                                width: 30, height: 30, borderRadius: "8px",
                                color: "#EF4444",
                                "&:hover": { backgroundColor: "#FFF1F2" },
                                transition: "background 0.12s",
                              }}
                            >
                              <DeleteIcon size={15} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination ── */}
        <Box
          sx={{
            borderTop: "1px solid #F0F1F5",
            backgroundColor: "#FAFBFC",
          }}
        >
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={totalCount}
            rowsPerPage={pageSize}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontSize: "0.8125rem",
                color: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
              },
              "& .MuiTablePagination-select": {
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.8125rem",
              },
              "& .MuiIconButton-root": {
                borderRadius: "8px",
                "&:hover": { backgroundColor: "#EEF2FF" },
              },
            }}
          />
        </Box>
      </Box>

      {/* ── Company Details Modal ── */}
      <CompanyDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        initialData={selectedCompanyData || undefined}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog
        open={deleteConfirm !== null}
        onClose={() => !deleting && setDeleteConfirm(null)}
        PaperProps={{
          sx: {
            borderRadius: "18px",
            maxWidth: 420,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.12)",
            overflow: "hidden",
          },
        }}
      >
        {/* Red accent strip */}
        <Box
          sx={{
            height: 3,
            background: "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
          }}
        />

        <Box sx={{ p: 3 }}>
          {/* Warning icon */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "14px",
              backgroundColor: "#FFF1F2",
              border: "1.5px solid #FECDD3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <AlertTriangle size={22} color="#EF4444" strokeWidth={1.75} />
          </Box>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "1.0625rem",
              color: "#111827",
              fontFamily: "'DM Sans', sans-serif",
              mb: 0.75,
              letterSpacing: "-0.2px",
            }}
          >
            Delete company?
          </Typography>

          <Typography
            sx={{
              fontSize: "0.875rem",
              color: "#6B7280",
              fontFamily: "'DM Sans', sans-serif",
              lineHeight: 1.65,
              mb: 0.75,
            }}
          >
            You're about to permanently delete{" "}
            <Box
              component="span"
              sx={{ fontWeight: 600, color: "#374151" }}
            >
              {deleteConfirm?.name}
            </Box>
            . This will remove all associated contacts, addresses, bank details, and settings.
          </Typography>

          <Box
            sx={{
              backgroundColor: "#FFF8F8",
              border: "1px solid #FECDD3",
              borderRadius: "8px",
              px: 1.75,
              py: 1.1,
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.8125rem",
                color: "#BE123C",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
              }}
            >
              This action cannot be undone.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.25, justifyContent: "flex-end" }}>
            <Button
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                px: 2.25,
                py: 1,
                color: "#374151",
                backgroundColor: "#F3F4F6",
                border: "1px solid #E5E7EB",
                "&:hover": {
                  backgroundColor: "#E9EAEC",
                  borderColor: "#D1D5DB",
                },
                boxShadow: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              disabled={deleting}
              disableElevation
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "0.875rem",
                px: 2.25,
                py: 1,
                backgroundColor: "#EF4444",
                boxShadow: "0 1px 3px rgba(239,68,68,0.25), 0 4px 12px rgba(239,68,68,0.2)",
                "&:hover": {
                  backgroundColor: "#DC2626",
                  boxShadow: "0 2px 6px rgba(239,68,68,0.3), 0 6px 18px rgba(239,68,68,0.22)",
                },
                "&:disabled": {
                  backgroundColor: "#FCA5A5",
                  color: "#fff",
                },
                transition: "all 0.15s ease",
              }}
            >
              {deleting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={15} thickness={3} sx={{ color: "white" }} />
                  Deleting…
                </Box>
              ) : (
                "Yes, delete"
              )}
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}