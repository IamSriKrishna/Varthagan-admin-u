'use client';

import React from 'react';
import SalesOrderForm from '@/components/salesOrders/SalesOrderForm';
import { useSearchParams } from 'next/navigation';

interface PageProps {
  params: {
    salesOrderId: string;
  };
}

export default function SalesOrderPage({ params }: PageProps) {
  const { salesOrderId } = params;
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  return <SalesOrderForm salesOrderId={salesOrderId} />;
}
