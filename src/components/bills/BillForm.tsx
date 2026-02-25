'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Container,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { Bill } from '@/models/bill.model';
import { billValidationSchema } from './billForm.validation';
import { initialBillValues, transformBillToPayload } from './billForm.utils';
import { useBill } from '@/hooks/useBill';
import BillBasicInfo from './BillBasicInfo';
import BillLineItems from './BillLineItems';
import BillBilling from './BillBilling';
import BBButton from '@/lib/BBButton/BBButton';
import BBTitle from '@/lib/BBTitle/BBTitle';

interface BillFormProps {
  billId?: string;
}

export default function BillForm({ billId }: BillFormProps) {
  const router = useRouter();
  const { createBill, updateBill, getBill, loading } = useBill();
  const [pageError, setPageError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(!!billId && billId !== 'new');

  const formik = useFormik<Bill>({
    initialValues: initialBillValues,
    validationSchema: billValidationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setPageError(null);
        const payload = transformBillToPayload(values);
        console.log('Submitting payload:', payload);

        if (billId && billId !== 'new') {
          console.log('Updating bill:', billId);
          await updateBill(billId, payload);
        } else {
          console.log('Creating new bill');
          await createBill(payload);
        }
        console.log('Bill saved successfully');
        router.push('/bills');
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save bill';
        setPageError(errorMessage);
        console.error('Form submission error:', err);
      }
    },
  });

  useEffect(() => {
    const loadBill = async () => {
      if (billId && billId !== 'new') {
        try {
          setInitialLoading(true);
          const bill = await getBill(billId);
          formik.setValues(bill);
        } catch (err: any) {
          const errorMessage = err?.message || 'Failed to load bill';
          setPageError(errorMessage);
          console.error('Failed to load bill:', err);
        } finally {
          setInitialLoading(false);
        }
      }
    };

    loadBill();
  }, [billId]);

  if (initialLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
          <CardContent sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading Bill...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <BBTitle title={billId && billId !== 'new' ? 'Edit Bill' : 'Create New Bill'} />
      </Box>

      {pageError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setPageError(null)}>
          {pageError}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {/* Basic Info Section */}
        <BillBasicInfo formik={formik} />

        {/* Line Items Section */}
        <BillLineItems formik={formik} />

        {/* Billing Section */}
        <BillBilling formik={formik} />

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 4,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => router.push('/bills')}
            disabled={loading}
          >
            Cancel
          </Button>
          <BBButton
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            loading={loading}
          >
            {billId && billId !== 'new' ? 'Update Bill' : 'Save Bill'}
          </BBButton>
        </Box>
      </form>
    </Container>
  );
}
