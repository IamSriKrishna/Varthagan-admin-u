import { Box, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

// ─── Design Tokens (same T object as the rest of your app) ────────────────────
const T = {
  brand: '#4F46E5',
  brandSoft: '#EEF2FF',
  brandMid: '#818CF8',
  text: '#0F172A',
  textLight: '#64748B',
  border: '#E8EBF2',
  subtleBg: '#F4F5F9',
};

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: string | number | ReactNode;
  action?: ReactNode;
  onClick?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, action, onClick }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {/* Icon container */}
      <Box sx={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: { xs: 36, sm: 38 }, height: { xs: 36, sm: 38 },
        borderRadius: '10px',
        background: T.brandSoft,
        border: `1.5px solid ${T.brandMid}30`,
        mr: { xs: 1.5, sm: 2 },
        flexShrink: 0,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'scale(1.08)',
          boxShadow: `0 2px 8px ${T.brand}20`,
        },
      }}>
        <Icon size={16} color={T.brand} strokeWidth={2.5} />
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          display: 'block', mb: 0.2,
          fontSize: { xs: '0.65rem', sm: '0.68rem' },
          fontWeight: 600, color: T.textLight,
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {label}
        </Typography>
        <Typography sx={{
          fontSize: { xs: '0.82rem', sm: '0.875rem' },
          fontWeight: 600, color: onClick ? T.brand : T.text,
          wordBreak: 'break-word', overflow: 'hidden',
          textOverflow: 'ellipsis',
          cursor: onClick ? 'pointer' : 'default',
          textDecoration: onClick ? 'underline' : 'none',
          textDecorationStyle: 'dashed',
          textUnderlineOffset: '3px',
          transition: 'color 0.15s',
          '&:hover': onClick ? { color: '#3730A3' } : {},
        }}
          onClick={onClick}
        >
          {value ?? 'N/A'}
        </Typography>
      </Box>

      {action && <Box sx={{ ml: 1.5, flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default InfoRow;