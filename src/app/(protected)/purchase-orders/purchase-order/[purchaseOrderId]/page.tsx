import { Suspense } from 'react';
import PurchaseOrderForm from '@/components/purchaseOrders/PurchaseOrderForm';

interface PurchaseOrderDetailPageProps {
  params: Promise<{
    purchaseOrderId: string;
  }>;
}

function LoadingFallback() {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
          .skeleton-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
        `
      }} />
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '32px 16px' 
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '32px' }}>
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '400px', 
              height: '48px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px',
              marginBottom: '8px'
            }} 
          />
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '300px', 
              height: '24px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '4px'
            }} 
          />
        </div>

        {/* Stepper Skeleton */}
        <div style={{ 
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '100%', 
              height: '80px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '8px'
            }} 
          />
        </div>

        {/* Form Skeleton */}
        <div style={{ 
          padding: '24px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '100%', 
              height: '64px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '8px',
              marginBottom: '24px'
            }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '16px' }}>
            <div 
              className="skeleton-pulse"
              style={{ 
                width: '100%', 
                height: '56px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '8px'
              }} 
            />
            <div 
              className="skeleton-pulse"
              style={{ 
                width: '100%', 
                height: '56px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '8px'
              }} 
            />
            <div 
              className="skeleton-pulse"
              style={{ 
                width: '100%', 
                height: '120px', 
                backgroundColor: '#e0e0e0', 
                borderRadius: '8px'
              }} 
            />
          </div>
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '100%', 
              height: '60px', 
              backgroundColor: '#e0e0e0', 
              borderRadius: '8px',
              marginTop: '24px'
            }} 
          />
        </div>
      </div>
    </>
  );
}

export default async function PurchaseOrderDetailPage({
  params,
}: PurchaseOrderDetailPageProps) {
  const { purchaseOrderId } = await params;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PurchaseOrderForm purchaseOrderId={purchaseOrderId} />
    </Suspense>
  );
}