'use client';

import React from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import { Package, PackageLineItem } from '@/models/package.model';

interface PackageLineItemsProps {
  formik: FormikProps<Package>;
}

const fieldSx = {
  width: 80,
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontFamily: '"DM Mono"',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: '#c7d2fe' },
    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
    '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' },
  },
};

export default function PackageLineItems({ formik }: PackageLineItemsProps) {
  const handlePackedQtyChange = (index: number, value: string) => {
    const qty = Math.max(0, parseInt(value) || 0);
    const items = [...formik.values.items];
    if (items[index].ordered_qty >= qty) {
      items[index].packed_qty = qty;
      formik.setFieldValue('items', items);
    }
  };

  const handleDeleteItem = (index: number) => {
    formik.setFieldValue('items', formik.values.items.filter((_: any, i: number) => i !== index));
  };

  const totalOrdered = formik.values.items.reduce((s: number, i: any) => s + (i.ordered_qty || 0), 0);
  const totalPacked = formik.values.items.reduce((s: number, i: any) => s + (i.packed_qty || 0), 0);

  return (
    <Box>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* ── Info banner ── */}
      {formik.values.items.length > 0 && (
        <Box sx={{ mb: 2.5, p: 1.75, borderRadius: '10px', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: '1rem' }}>💡</Typography>
          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#92400e', flex: 1 }}>
            Items were auto-populated from the sales order. Adjust packed quantities as needed.
          </Typography>
          <Button
            startIcon={<QrCodeScannerIcon sx={{ fontSize: '15px !important' }} />}
            size="small"
            sx={{ textTransform: 'none', fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.78rem', color: '#d97706', border: '1.5px solid #fcd34d', borderRadius: '8px', backgroundColor: '#fffbeb', flexShrink: 0, whiteSpace: 'nowrap', '&:hover': { backgroundColor: '#fef3c7' } }}
          >
            Scan Items
          </Button>
        </Box>
      )}

      {/* ── Table or Empty state ── */}
      {formik.values.items.length > 0 ? (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px', border: '1.5px solid #e2e8f0', overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  {['Item & Description', 'Ordered', 'Packed', 'Qty to Pack', ''].map((h, i) => (
                    <TableCell key={i} align={i === 0 ? 'left' : 'center'}
                      sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, px: 2, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {formik.values.items.map((item: PackageLineItem, index: number) => {
                  const pct = item.ordered_qty ? Math.round((item.packed_qty / item.ordered_qty) * 100) : 0;
                  const isDone = pct === 100;
                  return (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#fafbff' }, '&:last-child td': { border: 0 }, transition: 'background 0.12s' }}>
                      {/* Item name */}
                      <TableCell sx={{ px: 2, py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {isDone && <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0 }} />}
                          <Box>
                            <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                              {item.item?.name || '—'}
                            </Typography>
                            {item.variant_details && Object.keys(item.variant_details).length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.4 }}>
                                {Object.entries(item.variant_details).map(([k, v]) => (
                                  <Chip key={k} label={`${k}: ${v}`} size="small" sx={{ height: 18, fontSize: '0.68rem', fontFamily: '"DM Sans"', backgroundColor: '#eef2ff', color: '#4f46e5', borderRadius: '5px', '& .MuiChip-label': { px: 0.75 } }} />
                                ))}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Ordered */}
                      <TableCell align="center" sx={{ px: 2 }}>
                        <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
                          {item.ordered_qty}
                        </Typography>
                      </TableCell>

                      {/* Packed */}
                      <TableCell align="center" sx={{ px: 2 }}>
                        <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 600, fontSize: '0.875rem', color: '#94a3b8' }}>
                          0
                        </Typography>
                      </TableCell>

                      {/* Qty to pack */}
                      <TableCell align="center" sx={{ px: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <TextField
                            type="number"
                            value={item.packed_qty}
                            onChange={(e) => handlePackedQtyChange(index, e.target.value)}
                            inputProps={{ min: 0, max: item.ordered_qty, style: { textAlign: 'center', padding: '6px 8px' } }}
                            size="small"
                            sx={fieldSx}
                          />
                          {/* Mini progress */}
                          <Box sx={{ width: 70 }}>
                            <LinearProgress variant="determinate" value={pct} sx={{ height: 3, borderRadius: 2, backgroundColor: '#e0e7ff', '& .MuiLinearProgress-bar': { borderRadius: 2, backgroundColor: isDone ? '#10b981' : '#6366f1' } }} />
                          </Box>
                          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.68rem', color: isDone ? '#10b981' : '#94a3b8', fontWeight: isDone ? 600 : 400 }}>
                            {pct}%
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Delete */}
                      <TableCell align="center" sx={{ px: 1.5 }}>
                        <Tooltip title="Remove item" placement="left">
                          <IconButton size="small" onClick={() => handleDeleteItem(index)}
                            sx={{ color: '#cbd5e1', borderRadius: '8px', '&:hover': { color: '#ef4444', backgroundColor: '#fef2f2' } }}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Totals row ── */}
          <Box sx={{ mt: 1.5, px: 2, py: 1.25, backgroundColor: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Ordered</Typography>
              <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{totalOrdered}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total to Pack</Typography>
              <Typography sx={{ fontFamily: '"DM Mono"', fontWeight: 700, fontSize: '1rem', color: '#6366f1' }}>{totalPacked}</Typography>
            </Box>
          </Box>
        </>
      ) : (
        <Box sx={{ p: 5, textAlign: 'center', backgroundColor: '#fafbff', borderRadius: '12px', border: '1.5px dashed #c7d2fe' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
            <InventoryOutlinedIcon sx={{ color: '#6366f1', fontSize: 22 }} />
          </Box>
          <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 600, fontSize: '0.9rem', color: '#334155', mb: 0.5 }}>No items yet</Typography>
          <Typography sx={{ fontFamily: '"DM Sans"', fontSize: '0.82rem', color: '#94a3b8' }}>
            Select a sales order above to auto-populate items
          </Typography>
        </Box>
      )}

      {/* ── Internal Notes ── */}
      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontFamily: '"DM Sans"', fontWeight: 700, fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
          Internal Notes
        </Typography>
        <TextField
          fullWidth
          value={formik.values.internal_notes || ''}
          onChange={(e) => formik.setFieldValue('internal_notes', e.target.value)}
          multiline
          rows={3}
          placeholder="Add any notes visible only to your team…"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              fontFamily: '"DM Sans"',
              fontSize: '0.875rem',
              backgroundColor: '#fff',
              '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1.5px' },
              '&:hover fieldset': { borderColor: '#c7d2fe' },
              '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: '2px' },
              '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(99,102,241,0.08)' },
            },
            '& textarea': { fontFamily: '"DM Sans"', fontSize: '0.875rem', lineHeight: 1.6 },
          }}
        />
      </Box>
    </Box>
  );
}