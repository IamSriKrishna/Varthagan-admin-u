import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
} from '@mui/material';
import { Download, Edit, Trash2 } from 'lucide-react';
import { Employee } from '@/models/employee.model';
import { formatSalary, formatDate, formatEmployeeType } from '@/utils/employeeUtils';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (id: number) => void;
  onDownloadDocument?: (url: string, name: string) => void;
  variant?: 'compact' | 'full';
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  onDownloadDocument,
  variant = 'full',
}) => {
  const initials = employee.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getAvatarColor = (id: number): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    return colors[id % colors.length];
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header with Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: getAvatarColor(employee.id),
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {employee.name}
            </Typography>
            <Chip
              label={formatEmployeeType(employee.employee_type)}
              size="small"
              color={employee.employee_type === 'full-time' ? 'primary' : 'default'}
              variant={employee.employee_type === 'full-time' ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>

        {/* Employee Details */}
        {variant === 'full' && (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {employee.email && (
              <Box>
                <Typography variant="caption" color="textSecondary" display="block">
                  Email
                </Typography>
                <Typography variant="body2">{employee.email}</Typography>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Phone
              </Typography>
              <Typography variant="body2">{employee.number}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Address
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {employee.address}
              </Typography>
            </Box>

            <Box sx={{ backgroundColor: '#f5f5f5', p: 1.5, borderRadius: 1 }}>
              <Typography variant="caption" color="textSecondary" display="block">
                Monthly Salary
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                {formatSalary(employee.monthly_salary)}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="textSecondary" display="block">
                Created
              </Typography>
              <Typography variant="caption">{formatDate(employee.created_at)}</Typography>
            </Box>
          </Stack>
        )}

        {variant === 'compact' && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {employee.number}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {formatSalary(employee.monthly_salary)}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Card Actions */}
      <CardActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          pt: 0,
          backgroundColor: '#fafafa',
          borderTop: '1px solid #eee',
        }}
      >
        <Box>
          {employee.document_url && onDownloadDocument && (
            <Tooltip title="Download document">
              <IconButton
                size="small"
                onClick={() => onDownloadDocument(employee.document_url || '', employee.name)}
              >
                <Download size={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(employee)}>
                <Edit size={18} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(employee.id)}>
                <Trash2 size={18} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardActions>

      {/* Document Indicator */}
      {employee.document_url && (
        <Box
          sx={{
            px: 2,
            py: 1,
            backgroundColor: '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.75rem',
            color: '#2e7d32',
          }}
        >
          <span>✓</span>
          <span>Document uploaded</span>
        </Box>
      )}
    </Card>
  );
};

export default EmployeeCard;
