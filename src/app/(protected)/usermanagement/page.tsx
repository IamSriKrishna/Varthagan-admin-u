"use client";

import ResetUserManagementPassword from "@/components/usermanagement/ResetUserManagementPassword";
import UserManagementForm from "@/components/usermanagement/UserForm/UserForm";
import { BBLoader, BBTable } from "@/lib";
import { ITableColumn } from "@/lib/BBTable/BBTable";
import HighlightedCell from "@/lib/BBTable/HighlightedCell";
import { userApi, User } from "@/lib/api/userApi";
import { getStatusTypeBadge } from "@/styles/listtable.styles";
import { showToastMessage } from "@/utils/toastUtil";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ListRestart,
  PencilLine,
  Plus,
  Trash2,
  Eye,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: {
    total: number;
    current_page: number;
    per_page: number;
    total_pages: number;
  };
};

// ─── Status chip ────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  const palette: Record<string, { bg: string; color: string; dot: string }> = {
    active:   { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
    inactive: { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
    pending:  { bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  };
  const p = palette[status] ?? { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1.2,
        py: 0.35,
        borderRadius: "20px",
        backgroundColor: p.bg,
        color: p.color,
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.02em",
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: p.dot,
          flexShrink: 0,
        }}
      />
      {label}
    </Box>
  );
}

// ─── Action icon button ──────────────────────────────────────────────────────
function ActionBtn({
  onClick,
  title,
  icon,
  hoverColor = "#4f63d2",
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  hoverColor?: string;
}) {
  return (
    <IconButton
      size="small"
      onClick={onClick}
      title={title}
      sx={{
        width: 30,
        height: 30,
        borderRadius: "8px",
        color: "#94a3b8",
        border: "1px solid #e2e8f0",
        backgroundColor: "#fff",
        transition: "all 0.15s ease",
        "&:hover": {
          color: hoverColor,
          borderColor: hoverColor,
          backgroundColor: `${hoverColor}12`,
          transform: "translateY(-1px)",
          boxShadow: `0 3px 8px ${hoverColor}30`,
        },
      }}
    >
      {icon}
    </IconButton>
  );
}

// ─── Delete confirmation dialog ──────────────────────────────────────────────
function DeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.13)",
          border: "1px solid #f1f5f9",
        },
      }}
    >
      <Box sx={{ height: 4, background: "linear-gradient(90deg,#ef4444,#f97316)" }} />
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Stack alignItems="center" spacing={2} sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertTriangle size={24} color="#ef4444" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>
              Delete User?
            </Typography>
            <Typography sx={{ fontSize: "0.83rem", color: "#64748b", mt: 0.5, lineHeight: 1.5 }}>
              This action <strong>cannot be undone</strong>. All data associated with this user
              will be permanently removed.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ width: "100%", pt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#e2e8f0",
                color: "#475569",
                fontFamily: "'DM Sans', sans-serif",
                "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={onConfirm}
              disabled={loading}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                background: "linear-gradient(135deg,#ef4444,#f97316)",
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(135deg,#dc2626,#ea580c)",
                  boxShadow: "0 4px 14px rgba(239,68,68,.35)",
                },
              }}
            >
              {loading ? "Deleting…" : "Delete"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// ─── View user dialog ────────────────────────────────────────────────────────
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

  const field = (label: string, value: string | number | undefined | null) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.3,
        p: 1.5,
        borderRadius: "10px",
        backgroundColor: "#f8fafc",
        border: "1px solid #f1f5f9",
      }}
    >
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#0f172a" }}>
        {value || "—"}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.12)",
          border: "1px solid #f1f5f9",
        },
      }}
    >
      <Box sx={{ height: 4, background: "linear-gradient(90deg,#4f63d2,#7c3aed)" }} />

      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #f0f0f5",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "linear-gradient(135deg,#4f63d2,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79,99,210,.3)",
            }}
          >
            <Eye size={17} color="white" />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", letterSpacing: "-0.2px" }}>
              User Details
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              #{user.id}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "#9ca3af",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            width: 30,
            height: 30,
            "&:hover": { backgroundColor: "#fee2e2", color: "#ef4444" },
            transition: "all 0.15s ease",
          }}
        >
          <X size={15} />
        </IconButton>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 3, py: 2.5 }}>
        <Stack spacing={1.5}>
          {field("Username", user.username)}
          {field("Email", user.email)}
          {field("Phone", user.phone)}
          {field("Company", user.company_name)}
          {field("User Type", user.user_type)}
          {field("Role", user.role)}
          <Box sx={{ p: 1.5, borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.5 }}>
              Status
            </Typography>
            <StatusChip status={user.status} />
          </Box>
        </Stack>
      </DialogContent>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #f0f0f5" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            borderColor: "#e2e8f0",
            color: "#475569",
            "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
          }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
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
      }
    } catch (error: any) {
      showToastMessage(
        error.response?.data?.message || error.message || "Failed to fetch users",
        "error",
      );
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
      label: "Name",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Avatar circle */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "10px",
              background: "linear-gradient(135deg,#4f63d2,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.75rem",
              letterSpacing: "0.02em",
            }}
          >
            {(row.username?.[0] ?? "U").toUpperCase()}
          </Box>
          <HighlightedCell value={row.username} search={search} />
        </Box>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row) => <HighlightedCell value={row.email || "—"} search={search} />,
    },
    {
      key: "phone",
      label: "Phone",
      render: (row) => <HighlightedCell value={row.phone || "—"} search={search} />,
    },
    {
      key: "company_name" as any,
      label: "Company",
      render: (row) => <HighlightedCell value={row.company_name || "—"} search={search} />,
    },
    { key: "user_type", label: "User Type" },
    { key: "role", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: "action" as any,
      label: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.75}>
          <ActionBtn
            title="View"
            icon={<Eye size={14} />}
            onClick={() => { setSelectedUser(row); setOpenViewDialog(true); }}
          />
          <ActionBtn
            title="Edit"
            icon={<PencilLine size={14} />}
            onClick={() => { setEditUserId(row.id); setOpenForm(true); }}
          />
          <ActionBtn
            title="Delete"
            hoverColor="#ef4444"
            icon={<Trash2 size={14} />}
            onClick={() => { setDeleteUserId(row.id); setDeleteOpen(true); }}
          />
          <ActionBtn
            title="Reset Password"
            hoverColor="#f59e0b"
            icon={<ListRestart size={14} />}
            onClick={() => { setResetPasswordUserId(row.id); setResetPasswordOpen(true); }}
          />
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <BBLoader enabled={loading} />

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* ── Page Header ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 5,
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2.5 }}>
            {/* Icon badge */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                background: "linear-gradient(135deg,#4f63d2 0%,#7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(79,99,210,.28)",
                flexShrink: 0,
                mt: 0.5,
              }}
            >
              <Users size={24} color="white" />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  color: "#1a1d2e",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                User Management
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  mt: 0.5,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                }}
              >
                Manage users, roles, and access permissions
              </Typography>
            </Box>
          </Box>

          {/* Create button */}
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => { setEditUserId(null); setOpenForm(true); }}
            sx={{
              px: 3,
              py: 1.25,
              borderRadius: "12px",
              background: "linear-gradient(135deg,#4f63d2 0%,#7c3aed 100%)",
              boxShadow: "0 4px 16px rgba(79,99,210,.35)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              letterSpacing: 0,
              "&:hover": {
                background: "linear-gradient(135deg,#3d52c7 0%,#6d28d9 100%)",
                boxShadow: "0 6px 22px rgba(79,99,210,.45)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Create User
          </Button>
        </Box>

        {/* Thin accent rule */}
        <Box
          sx={{
            height: 1,
            background: "linear-gradient(90deg,rgba(79,99,210,.3) 0%,transparent 80%)",
            mb: 4,
          }}
        />

        {/* Table card */}
        <Box
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid #e8ecf4",
            boxShadow: "0 4px 24px rgba(79,99,210,.06), 0 1px 4px rgba(0,0,0,.04)",
          }}
        >
          <BBTable
            data={users}
            columns={columns}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={totalCount}
            onPageChange={(newPage) => setPage(newPage)}
            onRowsPerPageChange={(newRows) => { setRowsPerPage(newRows); setPage(0); }}
          />
        </Box>
      </Container>

      {/* ── Dialogs ── */}
      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
      />

      <ViewUserDialog
        open={openViewDialog}
        onClose={() => { setOpenViewDialog(false); setSelectedUser(null); }}
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