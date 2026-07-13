"use client";

import ResetUserManagementPassword from "@/components/usermanagement/ResetUserManagementPassword";
import UserManagementForm from "@/components/usermanagement/UserForm/UserForm";
import { BBButton, BBDialog, BBInputBase, BBLoader, BBTable } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { userApi, User } from "@/lib/api/userApi";
import { useDebounce } from "@/hooks/useDebounce";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Eye,
  ListRestart,
  Mail,
  PencilLine,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const AVATAR_PALETTE = [
  { bg: "#e8edff", color: "#3d52c7" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#d1fae5", color: "#065f46" },
  { bg: "#fff3cd", color: "#92400e" },
  { bg: "#ede9fe", color: "#6d28d9" },
  { bg: "#fee2e2", color: "#991b1b" },
  { bg: "#e0f2fe", color: "#0369a1" },
];

function getAvatarStyle(name: string) {
  const index =
    name.split("").reduce((total, character) => total + character.charCodeAt(0), 0) %
    AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

function StatusChip({ status }: { status?: string }) {
  const normalizedStatus = (status || "unknown").toLowerCase();
  const styles: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    active: {
      bg: "#ecfdf5",
      color: "#047857",
      border: "#a7f3d0",
      dot: "#10b981",
    },
    inactive: {
      bg: "#fef2f2",
      color: "#b91c1c",
      border: "#fecaca",
      dot: "#ef4444",
    },
    pending: {
      bg: "#fffbeb",
      color: "#b45309",
      border: "#fde68a",
      dot: "#f59e0b",
    },
  };

  const current = styles[normalizedStatus] || {
    bg: "#f8fafc",
    color: "#64748b",
    border: "#e2e8f0",
    dot: "#94a3b8",
  };

  return (
    <Chip
      size="small"
      label={normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
      icon={
        <Box
          component="span"
          sx={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            bgcolor: current.dot,
          }}
        />
      }
      sx={{
        height: 23,
        borderRadius: "7px",
        bgcolor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: "0.7rem",
        "& .MuiChip-icon": { ml: 0.9, mr: -0.25 },
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}

function ViewUserDialog({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: User | null;
}) {
  if (!user) return null;

  const details = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone },
    { label: "Company", value: user.company_name },
    { label: "User Type", value: user.user_type },
    { label: "Role", value: user.role },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #eeeff5",
          boxShadow: "0 20px 70px rgba(26,29,46,0.16)",
          fontFamily: "'DM Sans', sans-serif",
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f5",
          bgcolor: "#ffffff",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 5px 14px rgba(14,165,233,0.28)",
            }}
          >
            <Eye size={18} color="white" />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1rem",
                color: "#1a1d2e",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              User Details
            </Typography>
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#9ca3af",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              #{String(user.id).padStart(5, "0")}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            bgcolor: "#f8f9fc",
            color: "#9ca3af",
            "&:hover": { bgcolor: "#fef2f2", color: "#ef4444" },
          }}
        >
          <X size={15} />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: "#ffffff" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {details.map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 1.75,
                borderRadius: "11px",
                bgcolor: "#f8fbff",
                border: "1px solid #eef2ff",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  color: "#9ca3af",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: "'DM Sans', sans-serif",
                  mb: 0.45,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.84rem",
                  color: "#374151",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  wordBreak: "break-word",
                }}
              >
                {item.value || "—"}
              </Typography>
            </Box>
          ))}

          <Box
            sx={{
              p: 1.75,
              borderRadius: "11px",
              bgcolor: "#f8fbff",
              border: "1px solid #eef2ff",
              gridColumn: { xs: "auto", sm: "1 / -1" },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#9ca3af",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontFamily: "'DM Sans', sans-serif",
                mb: 0.65,
              }}
            >
              Status
            </Typography>
            <StatusChip status={user.status} />
          </Box>
        </Box>
      </DialogContent>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f5" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: "10px",
            borderColor: "#dfe3ee",
            color: "#4b5563",
            textTransform: "none",
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            "&:hover": { borderColor: "#c7d2fe", bgcolor: "#f8fbff" },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

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
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userApi.listUsers({
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch.trim() || undefined,
      });

      if (response.success) {
        setUsers(response.data || []);
        setTotalCount(response.meta?.total || 0);
      } else {
        showToastMessage("Failed to fetch users", "error");
      }
    } catch (error: any) {
      showToastMessage(
        error.response?.data?.message || error.message || "Failed to fetch users",
        "error",
      );
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      setLoading(true);
      const response = await userApi.deleteUser(deleteUserId);
      if (response.success) {
        showToastMessage("User deleted successfully", "success");
        setDeleteOpen(false);
        setDeleteUserId(null);
        await fetchUsers();
      } else {
        showToastMessage("Failed to delete user", "error");
      }
    } catch (error: any) {
      showToastMessage(
        error.response?.data?.message || error.message || "Failed to delete user",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ITableColumn<User>[] = [
    {
      key: "username",
      label: "User",
      render: (row) => {
        const name = row.username || "Unknown User";
        const avatarStyle = getAvatarStyle(name);

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: avatarStyle.bg,
                color: avatarStyle.color,
                fontFamily: "'DM Sans', sans-serif",
                border: "1.5px solid",
                borderColor: `${avatarStyle.color}33`,
              }}
            >
              {getInitials(name) || "U"}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                <HighlightedCell value={name} search={search} />
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: "0.02em",
                }}
              >
                #{String(row.id || "").padStart(5, "0")}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      key: "email",
      label: "Email",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.email ? (
            <>
              <Mail size={13} color="#9ca3af" />
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#4f63d2",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <HighlightedCell value={row.email} search={search} />
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#d1d5db" }}>—</Typography>
          )}
        </Box>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {row.phone && <Phone size={13} color="#9ca3af" />}
          <Typography
            sx={{
              fontSize: "0.8rem",
              fontFamily: "'DM Mono', monospace",
              color: row.phone ? "#374151" : "#d1d5db",
              letterSpacing: "0.02em",
            }}
          >
            <HighlightedCell value={row.phone || "—"} search={search} />
          </Typography>
        </Box>
      ),
    },
    {
      key: "company_name" as keyof User,
      label: "Company",
      render: (row) => (
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: row.company_name ? "#374151" : "#d1d5db",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <HighlightedCell value={row.company_name || "—"} search={search} />
        </Typography>
      ),
    },
    {
      key: "user_type",
      label: "User Type",
      render: (row) => (
        <Chip
          label={row.user_type || "—"}
          size="small"
          sx={{
            height: 22,
            borderRadius: "6px",
            bgcolor: "#f0f4ff",
            color: "#4f63d2",
            border: "1px solid #c7d2fe",
            fontSize: "0.7rem",
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <ShieldCheck size={13} color="#9ca3af" />
          <Typography
            sx={{
              fontSize: "0.8rem",
              color: "#374151",
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "capitalize",
            }}
          >
            {row.role || "—"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: "action" as any,
      label: "",
      render: (row) => (
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            opacity: 0,
            transition: "opacity 0.15s ease",
            ".MuiTableRow-root:hover &": { opacity: 1 },
          }}
        >
          <Tooltip title="View user" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setSelectedUser(row);
                setOpenViewDialog(true);
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#0369a1",
                bgcolor: "#e0f2fe",
                "&:hover": { bgcolor: "#bae6fd", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <Eye size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit user" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setEditUserId(row.id);
                setOpenForm(true);
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#4f63d2",
                bgcolor: "#f0f4ff",
                "&:hover": { bgcolor: "#e0e7ff", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <PencilLine size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset password" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setResetPasswordUserId(row.id);
                setResetPasswordOpen(true);
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#b45309",
                bgcolor: "#fffbeb",
                "&:hover": { bgcolor: "#fef3c7", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <ListRestart size={14} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete user" arrow>
            <IconButton
              size="small"
              onClick={() => {
                setDeleteUserId(row.id);
                setDeleteOpen(true);
              }}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                color: "#ef4444",
                bgcolor: "#fef2f2",
                "&:hover": { bgcolor: "#fee2e2", transform: "scale(1.05)" },
                transition: "all 0.15s ease",
              }}
            >
              <Trash2 size={14} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "#f8f9fc",
      }}
    >
      <BBLoader enabled={loading} />

      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          bgcolor: "#ffffff",
          borderBottom: "1px solid #f0f0f5",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: "13px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 20px rgba(14, 165, 233, 0.3)",
                flexShrink: 0,
              }}
            >
              <Users size={22} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "-0.4px",
                  lineHeight: 1.15,
                }}
              >
                User Management
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontFamily: "'DM Sans', sans-serif",
                  mt: 0.25,
                }}
              >
                {totalCount} user{totalCount !== 1 ? "s" : ""} registered
              </Typography>
            </Box>
          </Box>

          <BBButton
            variant="contained"
            color="primary"
            startIcon={<Plus size={16} />}
            onClick={() => {
              setEditUserId(null);
              setOpenForm(true);
            }}
            sx={{
              px: 2.5,
              py: 1.1,
              borderRadius: "11px",
              background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
              boxShadow: "0 4px 14px rgba(14, 165, 233, 0.35)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
                boxShadow: "0 6px 20px rgba(14, 165, 233, 0.45)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Create User
          </BBButton>
        </Stack>
      </Box>

      <Box
        component={Paper}
        elevation={0}
        sx={{
          mx: 3,
          mt: 2.5,
          borderRadius: "14px 14px 0 0",
          border: "1px solid #eeeff5",
          borderBottom: "none",
          bgcolor: "#ffffff",
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ position: "relative", flexGrow: 1, maxWidth: 380 }}>
          <Box
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <Search size={15} />
          </Box>
          <BBInputBase
            label=""
            name="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by name, email, phone, or company…"
            sx={{ pl: 4.5 }}
          />
        </Box>

        {search && (
          <Chip
            label={`${users.length} result${users.length !== 1 ? "s" : ""}`}
            size="small"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              bgcolor: "#e0f2fe",
              color: "#0369a1",
              border: "1px solid #bae6fd",
              borderRadius: "8px",
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          mx: 3,
          mb: 3,
          borderRadius: "0 0 14px 14px",
          border: "1px solid #eeeff5",
          borderTop: "none",
          bgcolor: "#ffffff",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
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
          sx={{
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: "#f8fbff",
              color: "#6b7280",
              fontWeight: 600,
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontFamily: "'DM Sans', sans-serif",
              borderBottom: "1px solid #eeeff5",
              py: 1.5,
            },
            "& .MuiTableBody-root .MuiTableRow-root": {
              cursor: "pointer",
              transition: "background 0.12s ease",
              "&:hover": { bgcolor: "#f8fbff" },
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              borderBottom: "1px solid #f5f5fa",
              py: 1.5,
              fontFamily: "'DM Sans', sans-serif",
            },
          }}
        />
      </Box>

      <BBDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteUserId(null);
        }}
        title="Delete User"
        maxWidth="sm"
        content={
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: 2,
                bgcolor: "#fff5f5",
                border: "1px solid #fee2e2",
                borderRadius: "10px",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Trash2 size={16} color="#ef4444" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    color: "#991b1b",
                    fontFamily: "'DM Sans', sans-serif",
                    mb: 0.5,
                  }}
                >
                  This action cannot be undone
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.8125rem",
                    color: "#b91c1c",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  The selected user and all data associated with their account will be permanently
                  removed.
                </Typography>
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "#6b7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Are you sure you want to permanently delete this user?
            </Typography>
          </Box>
        }
        onConfirm={handleDelete}
        confirmText="Delete User"
        cancelText="Keep User"
        confirmColor="error"
      />

      <ViewUserDialog
        open={openViewDialog}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
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