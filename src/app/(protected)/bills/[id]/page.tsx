'use client';

import BillForm from '@/components/bills/BillForm';

export default function CreateBillPage({ params }: { params: { id?: string } }) {
  const billId = params?.id || 'new';

  return <BillForm billId={billId} />;
}
