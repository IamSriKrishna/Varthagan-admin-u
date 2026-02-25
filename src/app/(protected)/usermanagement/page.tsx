"use client";

import ResetUserManagementPassword from "@/components/usermanagement/ResetUserManagementPassword";
import UserManagementForm from "@/components/usermanagement/UserForm/UserForm";
import { config } from "@/config";
import { membership, usermangement } from "@/constants/apiConstants";
import useApi from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import useFetch from "@/hooks/useFetch";
import { BBDialog, BBInputBase, BBLoader, BBTable, BBTitle } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { getStatusTypeBadge } from "@/styles/listtable.styles";
import { showToastMessage } from "@/utils/toastUtil";
import { Box, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ListRestart, PencilLine, Trash2, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";

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

interface IUser {
  id: number;
  email?: string;
  username: string;
  phone?: number;
  user_type: string;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string;
}

export default function UserManagement() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [openMembership, setOpenMembership] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(null);
  const [membershipUserId, setMembershipUserId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search && debouncedSearch) {
      params.append("search", debouncedSearch);
    }
    if (filters.role && filters.role.trim()) {
      params.append("role", filters.role);
    }

    if (filters.status && filters.status.trim()) {
      params.append("status", filters.status);
    }

    params.append("page", String(page + 1));
    params.append("limit", String(rowsPerPage));

    return params.toString();
  }, [filters, debouncedSearch, page, rowsPerPage]);
  const {
    data: results,
    refetch,
    loading,
  } = useFetch<ApiResponse<IUser[]>>({
    url: `${usermangement.getUsers}?${queryParams}`,
    baseUrl: config.loginDomain,
  });

  const { mutateApi: updateMember } = useApi<ApiResponse<null>>("", "POST", undefined, config.customerDomain);
  const { mutateApi: deleteUser } = useApi<ApiResponse<null>>("", "DELETE", undefined, config.loginDomain);
  const handleDelete = async () => {
    if (!deleteUserId) return;
    try {
      const deleteUrl = `${usermangement.deleteUser}/${deleteUserId}`;
      const response = await deleteUser(undefined, deleteUrl);
      if (response?.success) {
        showToastMessage(response.message || "User deleted successfully", "success");
        refetch();
        setOpen(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };
  const handleMemberShip = async () => {
    if (!membershipUserId) return;
    try {
      const membershipUrl = membership.postMemberShip(membershipUserId);
      const response = await updateMember({}, membershipUrl);
      if (response?.success) {
        showToastMessage(response.message || "User deleted successfully", "success");
        refetch();
        setOpenMembership(false);
      } else {
        showToastMessage(response?.message ?? "Delete failed", "error");
      }
    } catch (e: unknown) {
      const errorMessage =
        typeof e === "object" && e !== null && "message" in e ? (e.message as string) : "Something went wrong.";
      showToastMessage(errorMessage, "error");
    }
  };

  const columns: ITableColumn<IUser>[] = [
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "user_type", label: "User Type" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (row) => {
        const label = row.status.charAt(0).toUpperCase() + row.status.slice(1);
        return (
          <Box sx={getStatusTypeBadge(row.status)}>
            <HighlightedCell value={label} search={filters?.status || filters?.search} />
          </Box>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setEditUserId(row.id);
              setOpenForm(true);
            }}
          >
            <PencilLine size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setDeleteUserId(row.id);
              setOpen(true);
            }}
          >
            <Trash2 size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            disabled={row.user_type === "mobile_user"}
            onClick={() => {
              setResetPasswordUserId(row.id);
              setResetPasswordOpen(true);
            }}
          >
            <ListRestart size={16} />
          </IconButton>
          <IconButton
            size="small"
            color="primary"
            onClick={() => {
              setOpenMembership(true);
              setMembershipUserId(row.id);
            }}
            title="Enable Membership"
          >
            <UserCheck size={18} />
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

      <BBTitle title="User Management" />
      <Box component={Paper} sx={{ borderRadius: "10px 10px 0 0", boxShadow: "none" }}>
        {/* <Typography variant="h6" sx={classes.filterStyle}>
          Filter
        </Typography> */}
        {/* 
        <Box sx={{ display: "flex", gap: 2, mb: 2, p: 2 }}>
          <BBDropdownBase
            name="role"
            label="Role"
            value={filters.role}
            options={Roles}
            onDropdownChange={(e, _name, val) => handleTypeChange("role", val as string)}
          />
          <BBDropdownBase
            name="status"
            label="Status"
            value={filters.status}
            options={activeTypes}
            onDropdownChange={(e, _name, val) => handleTypeChange("status", val as string)}
          />
        </Box>

        <Divider /> */}

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Box>
            <BBInputBase
              label=""
              name="search"
              value={filters.search}
              onChange={(e) => handleTypeChange("search", e.target.value)}
              placeholder="Enter Phone or Email"
            />
          </Box>
          {/* <BBButton
            variant="contained"
            color="primary"
            onClick={() => {
              setEditUserId(null);
              setOpenForm(true);
            }}
            startIcon={<Plus size={18} />}
          >
            Add New User
          </BBButton> */}
        </Stack>
      </Box>
      <BBTable
        data={results?.data ?? []}
        columns={columns}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={results?.meta?.total ?? 0}
        onPageChange={(newPage) => setPage(newPage)}
        onRowsPerPageChange={(newRows) => {
          setRowsPerPage(newRows);
          setPage(0);
        }}
      />
      <BBDialog
        open={openMembership}
        maxWidth="sm"
        onClose={() => setOpenMembership(false)}
        title="Enable Membership"
        content={
          <Box>
            Are you sure you want to enable this membership? <br />
            The user will gain access to all membership benefits.
          </Box>
        }
        onConfirm={handleMemberShip}
        confirmText="Enable"
        cancelText="Cancel"
        // confirmColor="success"
      />

      <BBDialog
        open={open}
        onClose={() => setOpen(false)}
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
      {resetPasswordUserId !== null && (
        <ResetUserManagementPassword
          userId={resetPasswordUserId}
          open={resetPasswordOpen}
          setOpen={setResetPasswordOpen}
        />
      )}
      <UserManagementForm open={openForm} setOpen={setOpenForm} userId={editUserId} refetch={refetch} />
    </Box>
  );
}
