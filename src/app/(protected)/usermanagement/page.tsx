"use client";

import ResetUserManagementPassword from "@/components/usermanagement/ResetUserManagementPassword";
import UserManagementForm from "@/components/usermanagement/UserForm/UserForm";
import { BBDialog, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { userApi, User } from "@/lib/api/userApi";
import { companyApi } from "@/lib/api/companyApi";
import { getStatusTypeBadge } from "@/styles/listtable.styles";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, Button, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ListRestart, PencilLine, Plus, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: {
    total: number;
    page: number;
    per_page: number;
  };
};

export default function UserManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [companyNames, setCompanyNames] = useState<Record<number, string>>({});
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch company names by ID
  const fetchCompanyNames = async (companyIds: number[]) => {
    const uniqueIds = [...new Set(companyIds)];
    const names: Record<number, string> = { ...companyNames };
    const idsToFetch = uniqueIds.filter(id => !names[id]);

    if (idsToFetch.length === 0) return;

    try {
      const promises = idsToFetch.map(id =>
        companyApi
          .getCompanyById(id)
          .then(response => {
            names[id] = response.company.company.company_name;
          })
          .catch(error => {
            console.error(`Failed to fetch company ${id}:`, error);
            names[id] = "-";
          })
      );

      await Promise.all(promises);
      setCompanyNames(names);
    } catch (error) {
      console.error("Failed to fetch company names:", error);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.listUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      if (response.success) {
        setUsers(response.data);
        setTotalCount(response.meta.total);

        // Fetch company names for all unique company_ids
        const companyIds = response.data
          .map(user => user.company_id)
          .filter((id): id is number => id !== undefined && id !== null);
        
        if (companyIds.length > 0) {
          await fetchCompanyNames(companyIds);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to fetch users";
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search]);

  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      setLoading(true);
      const response = await userApi.deleteUser(deleteUserId);
      if (response.success) {
        showToastMessage("User deleted successfully", "success");
        setDeleteOpen(false);
        setDeleteUserId(null);
        fetchUsers();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to delete user";
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const columns: ITableColumn<User>[] = [
    { 
      key: "username", 
      label: "Name",
      render: (row) => (
        <HighlightedCell value={row.username} search={search} />
      ),
    },
    { 
      key: "email", 
      label: "Email",
      render: (row) => (
        <HighlightedCell value={row.email || "-"} search={search} />
      ),
    },
    { 
      key: "phone", 
      label: "Phone",
      render: (row) => (
        <HighlightedCell value={row.phone || "-"} search={search} />
      ),
    },
    {
      key: "company_name" as any,
      label: "Company",
      render: (row) => (
        <HighlightedCell 
          value={row.company_id ? (companyNames[row.company_id] || "Loading...") : "-"} 
          search={search} 
        />
      ),
    },
    { key: "user_type", label: "User Type" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const label = row.status.charAt(0).toUpperCase() + row.status.slice(1);
        return (
          <Box sx={getStatusTypeBadge(row.status)}>
            <HighlightedCell value={label} search={search} />
          </Box>
        );
      },
    },
    {
      key: "action" as any,
      label: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            color="info"
            onClick={() => {
              setSelectedUser(row);
              setOpenViewDialog(true);
            }}
            title="View User"
          >
            <Eye size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setEditUserId(row.id);
              setOpenForm(true);
            }}
            title="Edit User"
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setDeleteUserId(row.id);
              setDeleteOpen(true);
            }}
            title="Delete User"
          >
            <Trash2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setResetPasswordUserId(row.id);
              setResetPasswordOpen(true);
            }}
            title="Reset Password"
          >
            <ListRestart size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <BBLoader enabled={loading} />

      <BBTitle title="User Management" />
      
      <Box component={Paper} sx={{ borderRadius: "10px 10px 0 0", boxShadow: "none" }}>
        <Stack 
          direction="row" 
          justifyContent="space-between" 
          alignItems="center" 
          sx={{ p: 2 }}
        >
          <Box flex={1}>
            {/* Search functionality can be added here if needed */}
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={() => {
              setEditUserId(null);
              setOpenForm(true);
            }}
            sx={{
              textTransform: "capitalize",
              fontWeight: 600,
            }}
          >
            Create User
          </Button>
        </Stack>
      </Box>

      <BBTable
        data={users}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
      />

      <BBDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete User"
        maxWidth="sm"
        content={
          <Box>
            <Typography>Are you sure you want to permanently delete the user?</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action <strong>cannot be undone</strong>. All data associated with this user will be permanently
              removed from the database.
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="error"
      />

      {/* View User Dialog */}
      <BBDialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedUser(null);
        }}
        title="View User Details"
        maxWidth="sm"
        content={
          selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">ID</Typography>
                  <Typography variant="body2">{selectedUser.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Username</Typography>
                  <Typography variant="body2">{selectedUser.username}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Email</Typography>
                  <Typography variant="body2">{selectedUser.email || "Not provided"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Phone</Typography>
                  <Typography variant="body2">{selectedUser.phone || "Not provided"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Company</Typography>
                  <Typography variant="body2">
                    {selectedUser.company_id ? (companyNames[selectedUser.company_id] || "Loading...") : "Not assigned"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">User Type</Typography>
                  <Typography variant="body2">{selectedUser.user_type}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Role</Typography>
                  <Typography variant="body2">{selectedUser.role || "Not assigned"}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Status</Typography>
                  <Box sx={getStatusTypeBadge(selectedUser.status)}>
                    <Typography variant="body2">
                      {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          )
        }
        HideCancelButton={false}
        cancelText="Close"
      />

      {resetPasswordUserId !== null && (
        <ResetUserManagementPassword
          userId={resetPasswordUserId}
          open={resetPasswordOpen}
          setOpen={setResetPasswordOpen}
        />
      )}

      <UserManagementForm 
        open={openForm} 
        setOpen={setOpenForm} 
        userId={editUserId} 
        refetch={fetchUsers}
      />
    </Box>
  );
}
