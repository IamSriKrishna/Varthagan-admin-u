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
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Chip,
  TablePagination,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Eye as EyeIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
} from "lucide-react";
import { CompanyData, companyApi } from "@/lib/api/companyApi";
import CompanyDetailsModal from "./CompanyDetailsModal";

interface CompaniesTableProps {
  onEdit?: (company: CompanyData) => void;
  onRefresh?: () => void;
  refreshTrigger?: number;
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
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
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
      const errorMessage =
        err.message ||
        err.response?.data?.error ||
        "Failed to fetch companies";
      setError(errorMessage);
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
      // Show success toast
    } catch (err: any) {
      alert(
        err.message ||
          err.response?.data?.error ||
          "Failed to delete company"
      );
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
    if (onEdit) {
      onEdit(company);
    }
  };

  const handleDeleteClick = (companyId: number) => {
    setDetailsOpen(false);
    setDeleteConfirm(companyId);
  };

  if (loading && companies.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
            <TableRow sx={{ borderBottom: "2px solid #e0e0e0" }}>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Company Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Business Type
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                GST / PAN
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Contact
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Location
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "center",
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "#424242",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  textAlign: "right",
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                      No companies found
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Create your first company to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              companies.map((item, index) => (
                <TableRow
                  key={item.company.id}
                  sx={{
                    "&:hover": {
                      backgroundColor: "#fafafa",
                      transition: "background-color 0.2s ease-in-out",
                    },
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {item.company.company_name}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "0.875rem" }}>
                      {item.company.business_type?.type_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "0.875rem" }}>
                      <Typography variant="caption" sx={{ display: "block", fontWeight: 500 }}>
                        {item.company.gst_number || "-"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {item.company.pan_number || "-"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "0.875rem" }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.contact.mobile}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: "block" }}
                      >
                        {item.contact.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ fontSize: "0.875rem" }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.address.city}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ display: "block" }}
                      >
                        {item.address.state?.state_name},{" "}
                        {item.address.country?.country_code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label="Active"
                      color="success"
                      variant="outlined"
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewClick(item)}
                          sx={{
                            color: "primary.main",
                            "&:hover": { backgroundColor: "primary.light", color: "white" },
                          }}
                        >
                          <EyeIcon size={18} />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirm(item.company.id)}
                          sx={{
                            color: "error.main",
                            "&:hover": { backgroundColor: "error.light", color: "white" },
                          }}
                        >
                          <DeleteIcon size={18} />
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => setPageSize(parseInt(event.target.value, 10))}
        sx={{
          backgroundColor: "#f8f9fa",
          borderTop: "1px solid #e0e0e0",
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            {
              fontSize: "0.875rem",
              fontWeight: 500,
            },
        }}
      />

      {/* Company Details Modal */}
      <CompanyDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        initialData={selectedCompanyData || undefined}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Company</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this company? This action cannot be
            undone and will remove all associated data including contacts,
            addresses, bank details, and settings.
          </DialogContentText>
        </DialogContent>
        <Box sx={{ display: "flex", gap: 1, p: 2, justifyContent: "flex-end" }}>
          <Button onClick={() => setDeleteConfirm(null)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (deleteConfirm) handleDelete(deleteConfirm);
            }}
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}

import { Typography } from "@mui/material";
