'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User, userApi } from '@/lib/api/userApi';
import { 
  Box, 
  TextField, 
  CircularProgress, 
  Paper, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import { Search, User as UserIcon, CheckCircle2 } from 'lucide-react';

interface AdminUserSelectorProps {
  onUserSelect: (user: User) => void;
  selectedUserId?: number;
  isOpen?: boolean;
}

export const AdminUserSelector = ({
  onUserSelect,
  selectedUserId,
  isOpen = true,
}: AdminUserSelectorProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<User[]>([]);
  const [mounted, setMounted] = useState(false);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch admin users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userApi.listUsers({ role: 'admin' });
        if (response.success && response.data) {
          setUsers(response.data);
          setFiltered(response.data);
        } else {
          setError('Failed to load users');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load users');
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(users);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const results = users.filter(
      (user) =>
        user.username?.toLowerCase().includes(lowerSearch) ||
        user.email?.toLowerCase().includes(lowerSearch) ||
        user.phone?.toLowerCase().includes(lowerSearch)
    );
    setFiltered(results);
  }, [searchTerm, users]);

  if (!isOpen || !mounted) return null;

  // Render the dropdown content
  const dropdownContent = (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: '120px',
        right: '20px',
        zIndex: 9999,
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        maxWidth: '420px',
        width: 'calc(100% - 40px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'slideDown 0.2s ease-out',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: '16px',
          borderBottom: '1px solid #E2E8F0',
          background: 'linear-gradient(130deg, #4F46E5 0%, #7C3AED 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fff',
            marginBottom: '12px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <UserIcon size={16} />
          Select Admin User
        </div>

        {/* Search Field */}
        <TextField
          fullWidth
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search size={16} style={{ marginRight: '8px', color: '#64748B' }} />,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              background: '#fff',
              fontSize: '13px',
              '& fieldset': {
                borderColor: '#E2E8F0',
              },
              '&:hover fieldset': {
                borderColor: '#4F46E5',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4F46E5',
              },
            },
          }}
        />
      </Box>

      {/* Content */}
      <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ margin: '12px', fontSize: '12px' }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px 16px',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && filtered.length === 0 && !error && (
          <Box
            sx={{
              padding: '24px 16px',
              textAlign: 'center',
              color: '#64748B',
              fontSize: '13px',
            }}
          >
            {searchTerm ? 'No users found matching your search' : 'No admin users available'}
          </Box>
        )}

        {!loading && filtered.length > 0 && (
          <List disablePadding>
            {filtered.map((user) => {
              const isSelected = user.id === selectedUserId;
              return (
                <ListItem
                  key={user.id}
                  disablePadding
                  sx={{
                    borderBottom: '1px solid #F1F5F9',
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemButton
                    onClick={() => onUserSelect(user)}
                    selected={isSelected}
                    sx={{
                      paddingY: '12px',
                      paddingX: '16px',
                      '&.Mui-selected': {
                        background: '#EEF2FF',
                      },
                      '&.Mui-selected:hover': {
                        background: '#E0E7FF',
                      },
                      '&:hover': {
                        background: '#F8FAFC',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Tooltip title={user.username}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px',
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#1E293B', fontSize: '13px' }}>
                              {user.username}
                            </span>
                            {isSelected && (
                              <CheckCircle2
                                size={16}
                                style={{ color: '#4F46E5', flexShrink: 0 }}
                              />
                            )}
                          </div>
                        </Tooltip>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {user.email && (
                            <Tooltip title={user.email}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  color: '#64748B',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '150px',
                                }}
                              >
                                {user.email}
                              </span>
                            </Tooltip>
                          )}
                          {user.status && (
                            <Chip
                              label={user.status}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: '18px',
                                fontSize: '10px',
                                backgroundColor:
                                  user.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                color: user.status === 'active' ? '#16A34A' : '#DC2626',
                                borderColor:
                                  user.status === 'active' ? '#16A34A' : '#DC2626',
                              }}
                            />
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{
                        style: { marginBottom: 0 },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      {!loading && filtered.length > 0 && (
        <Box
          sx={{
            padding: '12px 16px',
            borderTop: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: '12px',
            color: '#64748B',
          }}
        >
          Showing {filtered.length} of {users.length} users
        </Box>
      )}
    </Paper>
  );

  return createPortal(dropdownContent, document.body);
};
