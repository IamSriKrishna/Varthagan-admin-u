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
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }

            .skeleton-pulse {
              animation: pulse 1.5s ease-in-out infinite;
            }
          `,
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 'none',
          margin: 0,
          padding: '16px',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div
            className="skeleton-pulse"
            style={{
              width: '320px',
              height: '38px',
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
              marginBottom: '8px',
            }}
          />

          <div
            className="skeleton-pulse"
            style={{
              width: '260px',
              height: '18px',
              backgroundColor: '#e2e8f0',
              borderRadius: '8px',
            }}
          />
        </div>

        <div
          style={{
            marginBottom: '16px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
          }}
        >
          <div
            className="skeleton-pulse"
            style={{
              width: '100%',
              height: '62px',
              backgroundColor: '#e2e8f0',
              borderRadius: '10px',
            }}
          />
        </div>

        <div
          style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 14px rgba(15,23,42,0.04)',
          }}
        >
          <div
            className="skeleton-pulse"
            style={{
              width: '100%',
              height: '50px',
              backgroundColor: '#e2e8f0',
              borderRadius: '10px',
              marginBottom: '16px',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div
              className="skeleton-pulse"
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#e2e8f0',
                borderRadius: '10px',
              }}
            />

            <div
              className="skeleton-pulse"
              style={{
                width: '100%',
                height: '48px',
                backgroundColor: '#e2e8f0',
                borderRadius: '10px',
              }}
            />

            <div
              className="skeleton-pulse"
              style={{
                width: '100%',
                height: '90px',
                backgroundColor: '#e2e8f0',
                borderRadius: '10px',
              }}
            />
          </div>

          <div
            className="skeleton-pulse"
            style={{
              width: '100%',
              height: '52px',
              backgroundColor: '#e2e8f0',
              borderRadius: '10px',
              marginTop: '16px',
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
    <div
      style={{
        width: '100%',
        maxWidth: 'none',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        backgroundColor: '#f8fafc',
        boxSizing: 'border-box',
      }}
    >
      <Suspense fallback={<LoadingFallback />}>
        <PurchaseOrderForm purchaseOrderId={purchaseOrderId} />
      </Suspense>
    </div>
  );
}