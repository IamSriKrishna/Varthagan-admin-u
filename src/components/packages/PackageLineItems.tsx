'use client';

import React from 'react';
import { FormikProps } from 'formik';
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Fade,
  alpha,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Package, PackageLineItem } from '@/models/package.model';

interface PackageLineItemsProps {
  formik: FormikProps<Package>;
}

export default function PackageLineItems({
  formik,
}: PackageLineItemsProps) {
  const handlePackedQtyChange = (index: number, value: string) => {
    const packedQty = Math.max(0, parseInt(value) || 0);
    const items = [...formik.values.items];
    if (items[index].ordered_qty >= packedQty) {
      items[index].packed_qty = packedQty;
      formik.setFieldValue('items', items);
    }
  };

  const handleDeleteItem = (index: number) => {
    const items = formik.values.items.filter((_, i) => i !== index);
    formik.setFieldValue('items', items);
  };

  return (
    <Box>
      {/* Info Message */}
      {formik.values.items.length > 0 && (
        <Alert
          icon={<span>ℹ️</span>}
          sx={{
            mb: 3,
            backgroundColor: '#fff3cd',
            color: '#856404',
            border: '1px solid #ffc107',
            borderRadius: 1,
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
            },
          }}
        >
          You can also select or scan the items to be included from the sales order.{' '}
          <Typography
            component="span"
            sx={{
              color: '#0066cc',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontWeight: 500,
            }}
          >
            Select or Scan Items
          </Typography>
        </Alert>
      )}

      {/* Items Table */}
      {formik.values.items.length > 0 ? (
        <Fade in timeout={300}>
          <TableContainer component={Paper} sx={{ boxShadow: 0, border: '1px solid #e0e0e0' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem' }}>
                    ITEMS & DESCRIPTION
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem', width: 100 }}>
                    ORDERED
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem', width: 100 }}>
                    PACKED
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem', width: 150 }}>
                    QUANTITY TO PACK
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#333', fontSize: '0.85rem', width: 60 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formik.values.items.map((item: PackageLineItem, index: number) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#fafafa',
                      },
                      '&:last-child td': { border: 0 },
                    }}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {item.item?.name}
                        </Typography>
                        {item.variant_details && Object.keys(item.variant_details).length > 0 && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {Object.entries(item.variant_details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {item.ordered_qty}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        0
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={item.packed_qty}
                        onChange={(e) =>
                          handlePackedQtyChange(index, e.target.value)
                        }
                        inputProps={{
                          min: 0,
                          max: item.ordered_qty,
                          style: { textAlign: 'center' },
                        }}
                        size="small"
                        sx={{
                          width: 70,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                          },
                          '& input': {
                            fontSize: '0.9rem',
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'text.secondary',
                          mt: 0.5,
                          fontSize: '0.75rem',
                        }}
                      >
                        Available for Sale: {item.ordered_qty} box
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteItem(index)}
                        sx={{
                          color: '#d32f2f',
                          '&:hover': {
                            backgroundColor: alpha('#d32f2f', 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Fade>
      ) : (
        <Fade in timeout={300}>
          <Paper
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No items added. Select a sales order to populate items.
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Internal Notes */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#999' }}>
          INTERNAL NOTES
        </Typography>
        <TextField
          fullWidth
          value={formik.values.internal_notes || ''}
          onChange={(e) =>
            formik.setFieldValue('internal_notes', e.target.value)
          }
          multiline
          rows={4}
          placeholder="Add internal notes..."
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
}
