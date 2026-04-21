'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Bill } from '@/models/bill.model';
import { billValidationSchema } from './billForm.validation';
import { initialBillValues, transformBillToPayload } from './billForm.utils';
import { useBill } from '@/hooks/useBill';
import BillBasicInfo from './BillBasicInfo';
import BillLineItems from './BillLineItems';
import BillBilling from './BillBilling';
import BBButton from '@/lib/BBButton/BBButton';

interface BillFormProps {
  billId?: string;
}

export default function BillForm({ billId }: BillFormProps) {
  const router = useRouter();
  const { createBill, updateBill, getBill, loading } = useBill();
  const [pageError, setPageError] = useState<string | null>(null);
  const isEdit = !!billId && billId !== 'new';
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const formik = useFormik<Bill>({
    initialValues: initialBillValues,
    validationSchema: billValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        const payload = transformBillToPayload(values);
        if (isEdit) {
          await updateBill(billId, payload);
        } else {
          await createBill(payload);
        }
        router.push('/bills');
      } catch (err: any) {
        setPageError(err?.response?.data?.message || err?.message || 'Failed to save bill');
      }
    },
  });

  useEffect(() => {
    const loadBill = async () => {
      if (isEdit) {
        try {
          setInitialLoading(true);
          const bill = await getBill(billId);
          formik.setValues(bill);
        } catch (err: any) {
          setPageError(err?.message || 'Failed to load bill');
        } finally {
          setInitialLoading(false);
        }
      }
    };
    loadBill();
  }, [billId]);

  if (initialLoading) {
    return (
      <Box sx={{ bgcolor: '#f8f9fc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2,
            boxShadow: '0 8px 24px rgba(79,99,210,0.3)',
          }}>
            <CircularProgress size={28} sx={{ color: '#fff' }} />
          </Box>
          <Typography sx={{ fontFamily: "'DM Sans', sans-serif", color: '#6b70a3', fontWeight: 600 }}>
            Loading Bill…
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fc', minHeight: '100vh', pb: 10 }}>

      {/* ── Sticky Top Bar ── */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        bgcolor: 'rgba(248,249,252,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ecedf5',
        px: { xs: 2, md: 4 },
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/bills')}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              color: '#6b70a3',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { bgcolor: '#ecedf5' },
            }}
          >
            Bills
          </Button>
          <Box sx={{ width: 1, height: 16, bgcolor: '#dde0ee' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ReceiptLongIcon sx={{ fontSize: 16, color: '#fff' }} />
            </Box>
            <Typography sx={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1d2e' }}>
              {isEdit ? 'Edit Bill' : 'New Bill'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => router.push('/bills')}
            disabled={loading}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '9px',
              fontSize: 13,
              px: 2,
              borderColor: '#d0d3ea',
              color: '#6b70a3',
              '&:hover': { borderColor: '#9196b0', bgcolor: '#f4f5f9' },
            }}
          >
            Discard
          </Button>
          <BBButton
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            loading={loading}
            onClick={() => formik.handleSubmit()}
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '9px',
              fontSize: 13,
              px: 2.5,
              background: 'linear-gradient(135deg, #4f63d2, #7c3aed)',
              boxShadow: '0 4px 14px rgba(79,99,210,0.3)',
              '&:hover': { boxShadow: '0 6px 20px rgba(79,99,210,0.4)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s',
            }}
          >
            {isEdit ? 'Update Bill' : 'Save Bill'}
          </BBButton>
        </Box>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 4 }, pt: 4 }}>
        {pageError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', fontFamily: "'DM Sans', sans-serif" }} onClose={() => setPageError(null)}>
            {pageError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <BillBasicInfo formik={formik} />
          <BillLineItems formik={formik} />
          <BillBilling formik={formik} />
        </form>
      </Box>
    </Box>
  );
}