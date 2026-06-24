'use client';

import React from 'react';
import SalesOrderForm from '@/components/salesOrders/SalesOrderForm';
import { useSearchParams, useParams } from 'next/navigation';

export default function SalesOrderPage() {
  const params = useParams();
  const salesOrderId = params?.salesOrderId as string | undefined;
  const searchParams = useSearchParams();
  const modeParam = searchParams?.get('mode');
  const mode = (modeParam === 'view' || modeParam === 'edit' ? modeParam : 'edit') as 'view' | 'edit';

  // Debug: log incoming params to help diagnose navigation issues
  // eslint-disable-next-line no-console
  console.log('SalesOrderPage params (client):', { salesOrderId, mode });

  return <SalesOrderForm salesOrderId={salesOrderId} mode={mode} />;
}
