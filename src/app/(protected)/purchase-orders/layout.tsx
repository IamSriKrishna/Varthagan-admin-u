import { ReactNode } from 'react';
import { RequireAccess } from '@/components/common/RequireAccess';

export default function PurchaseOrdersLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RequireAccess pageKey="purchases">
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        {children}
      </div>
    </RequireAccess>
  );
}