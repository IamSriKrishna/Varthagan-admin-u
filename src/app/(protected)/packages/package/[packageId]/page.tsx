'use client';

import React from 'react';
import PackageForm from '@/components/packages/PackageForm';

interface PageProps {
  params: {
    packageId: string;
  };
}

export default function PackageDetailPage({ params }: PageProps) {
  const { packageId } = params;

  return <PackageForm packageId={packageId} />;
}
