'use client';

import React, { useEffect, useState } from 'react';
import { Container } from '@mui/material';
import { useParams } from 'next/navigation';
import ConversionForm from '@/components/conversion/ConversionForm';
import { conversionService } from '@/services/conversionService';
import { IConversionRule } from '@/models/conversion.model';
import { BBLoader } from '@/lib';
import { showToastMessage } from '@/utils/toastUtil';

export default function EditConversionPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [conversionRule, setConversionRule] = useState<IConversionRule | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    const fetchConversion = async () => {
      try {
        setLoading(true);
        const rule = await conversionService.getConversion(id);
        setConversionRule(rule);
      } catch (error) {
        console.error('Error fetching conversion:', error);
        showToastMessage('Failed to load conversion rule', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConversion();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <BBLoader />
      </Container>
    );
  }

  if (!conversionRule) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <div>Conversion rule not found</div>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <ConversionForm initialData={conversionRule} isEdit={true} />
    </Container>
  );
}
