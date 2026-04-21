'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Stack,
  Avatar,
  InputAdornment,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import { FormikProps } from 'formik';
import { SalesOrder } from '@/models/salesOrder.model';
import { customerService } from '@/lib/api/customerService';
import { appFetch } from '@/utils/fetchInterceptor';
import { config } from '@/config';
import { salespersons as salespersonsEndpoint } from '@/constants/apiConstants';
import AddIcon from '@mui/icons-material/Add';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface SalesOrderBasicInfoProps {
  formik: FormikProps<SalesOrder>;
  isEditMode?: boolean;
  onOpenCreateSalesperson?: () => void;
  salespersonRefreshTrigger?: number;
}

interface CustomerOption {
  id: number;
  display_name: string;
  company_name: string;
  email?: string;
  phone?: string;
}

interface SalespersonOption {
  id: number;
  name: string;
  email?: string;
}

// ── Generates a reference number: SO-YYYYMMDD-XXXXXX ──────────────────────────
// Using higher precision timestamp + random to reduce collision probability
function generateReferenceNo(): string {
  const now = new Date();
  const ymd =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  // Use 6-digit random (100000-999999) for better uniqueness
  const rand = Math.floor(100000 + Math.random() * 900000);
  // Add milliseconds last 2 digits for additional uniqueness
  const ms = now.getMilliseconds() % 100;
  return `SO-${ymd}-${String(ms).padStart(2, '0')}${rand}`;
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    fontSize: '0.9rem',
    bgcolor: '#fff',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root': { fontSize: '0.875rem' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0f172a' },
  '& .MuiFormHelperText-root': { fontSize: '0.75rem' },
};

// Read-only variant — used when reference is auto-managed
const autoFieldSx = {
  ...fieldSx,
  '& .MuiOutlinedInput-root': {
    ...fieldSx['& .MuiOutlinedInput-root'],
    bgcolor: '#f8fafc',
    '& fieldset': { borderColor: '#e2e8f0', borderStyle: 'dashed' },
    '&:hover fieldset': { borderColor: '#cbd5e1', borderStyle: 'dashed' },
    '&.Mui-focused fieldset': { borderColor: '#0f172a', borderWidth: 1.5, borderStyle: 'dashed' },
  },
};

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: '0.775rem', color: '#94a3b8' }}>{subtitle}</Typography>
      </Box>
    </Stack>
  );
}

function FieldLabel({ label, optional }: { label: string; optional?: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} mb={0.75}>
      <Typography
        sx={{
          fontSize: '0.775rem',
          fontWeight: 600,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      {optional && (
        <Typography sx={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>(optional)</Typography>
      )}
    </Stack>
  );
}

// ── Reference Number field with auto/manual toggle ───────────────────────────
interface ReferenceFieldProps {
  value: string | undefined;
  onChange: (val: string) => void;
  onBlur: () => void;
  error?: boolean;
  helperText?: string | false;
}

function ReferenceNumberField({ value, onChange, onBlur, error, helperText }: ReferenceFieldProps) {
  const [isAuto, setIsAuto] = useState(!value || value === ''); // start auto if no existing value

  const handleRegenerate = useCallback(() => {
    onChange(generateReferenceNo());
  }, [onChange]);

  // On mount, generate if blank and in auto mode
  useEffect(() => {
    if (isAuto && !value) {
      onChange(generateReferenceNo());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchToAuto = () => {
    setIsAuto(true);
    onChange(generateReferenceNo());
  };

  const switchToManual = () => {
    setIsAuto(false);
    // keep current value — user can edit it
  };

  return (
    <Box>
      {/* Label row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.75}>
        <FieldLabel label="Reference Number *" />

        {/* Auto / Manual pill toggle */}
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Auto-generate reference number" placement="top">
            <Chip
              size="small"
              icon={<AutorenewIcon sx={{ fontSize: '13px !important' }} />}
              label="Auto"
              onClick={switchToAuto}
              variant={isAuto ? 'filled' : 'outlined'}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 1.5,
                ...(isAuto
                  ? {
                      bgcolor: '#0f172a',
                      color: '#fff',
                      border: '1px solid #0f172a',
                      '& .MuiChip-icon': { color: '#94a3b8' },
                      '&:hover': { bgcolor: '#1e293b' },
                    }
                  : {
                      bgcolor: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #e2e8f0',
                      '& .MuiChip-icon': { color: '#cbd5e1' },
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                    }),
              }}
            />
          </Tooltip>
          <Tooltip title="Enter reference number manually" placement="top">
            <Chip
              size="small"
              icon={<EditOutlinedIcon sx={{ fontSize: '13px !important' }} />}
              label="Manual"
              onClick={switchToManual}
              variant={!isAuto ? 'filled' : 'outlined'}
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                borderRadius: 1.5,
                ...(!isAuto
                  ? {
                      bgcolor: '#0f172a',
                      color: '#fff',
                      border: '1px solid #0f172a',
                      '& .MuiChip-icon': { color: '#94a3b8' },
                      '&:hover': { bgcolor: '#1e293b' },
                    }
                  : {
                      bgcolor: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #e2e8f0',
                      '& .MuiChip-icon': { color: '#cbd5e1' },
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                    }),
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>

      {/* Input */}
      <TextField
        name="reference_no"
        value={value}
        onChange={(e) => !isAuto && onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={isAuto ? '' : 'e.g. SO-2024-001'}
        fullWidth
        inputProps={{ readOnly: isAuto }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <BadgeOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
            </InputAdornment>
          ),
          endAdornment: isAuto ? (
            <InputAdornment position="end">
              <Tooltip title="Generate a new reference number" placement="top">
                <IconButton
                  size="small"
                  onClick={handleRegenerate}
                  sx={{
                    width: 28,
                    height: 28,
                    color: '#64748b',
                    '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' },
                  }}
                >
                  <AutorenewIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : (
            <InputAdornment position="end">
              <LockOutlinedIcon sx={{ fontSize: 15, color: '#e2e8f0' }} />
            </InputAdornment>
          ),
        }}
        error={error}
        helperText={
          helperText || (
            <Box component="span" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              {isAuto
                ? 'Auto-generated — click ↺ to regenerate'
                : 'Type your own reference number'}
            </Box>
          )
        }
        sx={isAuto ? autoFieldSx : fieldSx}
      />
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SalesOrderBasicInfo({
  formik,
  isEditMode,
  onOpenCreateSalesperson,
  salespersonRefreshTrigger,
}: SalesOrderBasicInfoProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [salespersons, setSalespersons] = useState<SalespersonOption[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingSalespersons, setLoadingSalespersons] = useState(true);

  useEffect(() => {
    customerService
      .getCustomers(1, 1000)
      .then((res) => {
        if (res.success && res.data) setCustomers(res.data as any);
        setLoadingCustomers(false);
      })
      .catch(() => setLoadingCustomers(false));
  }, []);

  useEffect(() => {
    const apiDomain = config.apiDomain || '';
    appFetch(`${apiDomain}${salespersonsEndpoint.getSalespersons}`, { method: 'GET' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setSalespersons(
            Array.isArray(data.salespersons)
              ? data.salespersons
              : Array.isArray(data)
              ? data
              : []
          );
        }
        setLoadingSalespersons(false);
      })
      .catch(() => setLoadingSalespersons(false));
  }, [salespersonRefreshTrigger]);

  const currentCustomer = customers.find((c) => c.id === formik.values.customer_id) || null;
  const currentSalesperson = salespersons.find((s) => s.id === formik.values.salesperson_id) || null;

  return (
    <Stack spacing={3}>
      {/* ── People Card ── */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<PersonOutlineIcon sx={{ fontSize: 19 }} />}
            title="Parties"
            subtitle="Customer and salesperson assignment"
          />
          <Grid container spacing={2.5}>
            {/* Customer */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                sx={{
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  color: '#64748b',
                  mb: 0.75,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Customer *
              </Typography>
              <Autocomplete
                options={customers}
                getOptionLabel={(o) => o.display_name || o.company_name || ''}
                value={currentCustomer}
                onChange={(_, v) => {
                  formik.setFieldValue('customer_id', v?.id ?? 0);
                  formik.setFieldValue('customer', v ?? undefined);
                }}
                isOptionEqualToValue={(o, v) => o.id === v?.id}
                loading={loadingCustomers}
                disabled={isEditMode && !!formik.values.id}
                renderOption={(props, option) => (
                  <Box component="li" {...props} sx={{ gap: 1.5, py: '10px !important' }}>
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        bgcolor: `hsl(${(option.display_name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 88%)`,
                        color: `hsl(${(option.display_name?.charCodeAt(0) || 65) * 5 % 360}, 50%, 35%)`,
                        flexShrink: 0,
                      }}
                    >
                      {(option.display_name || 'N')[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {option.display_name}
                      </Typography>
                      {option.email && (
                        <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search customers…"
                    error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                    helperText={formik.touched.customer_id && formik.errors.customer_id}
                    sx={fieldSx}
                  />
                )}
              />
            </Grid>

            {/* Salesperson */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.75}>
                <Typography
                  sx={{
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Salesperson
                </Typography>
                {onOpenCreateSalesperson && (
                  <Button
                    size="small"
                    startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
                    onClick={onOpenCreateSalesperson}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      color: '#0f172a',
                      bgcolor: '#f1f5f9',
                      borderRadius: 1.5,
                      px: 1.25,
                      py: 0.4,
                      minHeight: 0,
                      '&:hover': { bgcolor: '#e2e8f0' },
                    }}
                  >
                    Add New
                  </Button>
                )}
              </Stack>
              <Autocomplete
                options={salespersons}
                getOptionLabel={(o) => o.name || ''}
                value={currentSalesperson}
                onChange={(_, v) => {
                  formik.setFieldValue('salesperson_id', v?.id ?? undefined);
                  formik.setFieldValue('salesperson', v ?? undefined);
                }}
                isOptionEqualToValue={(o, v) => o.id === v?.id}
                loading={loadingSalespersons}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select salesperson…"
                    helperText="Optional"
                    sx={fieldSx}
                    FormHelperTextProps={{ sx: { color: '#94a3b8' } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Order Details Card ── */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<TagOutlinedIcon sx={{ fontSize: 19 }} />}
            title="Order Details"
            subtitle="Reference numbers and dates"
          />
          <Grid container spacing={2.5}>
            {/* Reference Number — auto/manual */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <ReferenceNumberField
                value={formik.values.reference_no ?? ''}
                onChange={(val) => formik.setFieldValue('reference_no', val)}
                onBlur={() => formik.setFieldTouched('reference_no', true)}
                error={formik.touched.reference_no && Boolean(formik.errors.reference_no)}
                helperText={formik.touched.reference_no && formik.errors.reference_no}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Sales Order Date *" />
              <TextField
                name="sales_order_date"
                type="date"
                value={formik.values.sales_order_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                error={formik.touched.sales_order_date && Boolean(formik.errors.sales_order_date)}
                helperText={formik.touched.sales_order_date && formik.errors.sales_order_date}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Expected Shipment Date *" />
              <TextField
                name="expected_shipment_date"
                type="date"
                value={formik.values.expected_shipment_date}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalShippingOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                error={
                  formik.touched.expected_shipment_date &&
                  Boolean(formik.errors.expected_shipment_date)
                }
                helperText={
                  formik.touched.expected_shipment_date && formik.errors.expected_shipment_date
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Payment Terms *" />
              <TextField
                name="payment_terms"
                value={formik.values.payment_terms}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., Net 15"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentsOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                error={formik.touched.payment_terms && Boolean(formik.errors.payment_terms)}
                helperText={formik.touched.payment_terms && formik.errors.payment_terms}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel label="Delivery Method *" />
              <TextField
                name="delivery_method"
                value={formik.values.delivery_method}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g., Courier"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalShippingOutlinedIcon sx={{ fontSize: 17, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                error={formik.touched.delivery_method && Boolean(formik.errors.delivery_method)}
                helperText={formik.touched.delivery_method && formik.errors.delivery_method}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ── Notes Card ── */}
      <Card elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <SectionHeader
            icon={<NotesOutlinedIcon sx={{ fontSize: 19 }} />}
            title="Notes & Terms"
            subtitle="Customer-facing notes and legal terms"
          />
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <FieldLabel label="Customer Notes" optional />
              <TextField
                name="customer_notes"
                value={formik.values.customer_notes || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                multiline
                rows={3}
                placeholder="Add any special instructions or notes for this customer…"
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FieldLabel label="Terms & Conditions" optional />
              <TextField
                name="terms_and_conditions"
                value={formik.values.terms_and_conditions || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                fullWidth
                multiline
                rows={3}
                placeholder="Add payment and delivery terms…"
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}