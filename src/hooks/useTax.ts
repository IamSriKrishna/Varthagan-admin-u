import { useState, useEffect } from 'react';
import { Tax } from '@/models/purchaseOrder.model';
import { taxService } from '@/lib/api/taxService';

interface UseTaxReturn {
  taxes: Tax[];
  loading: boolean;
  error: string | null;
}

export const useTax = (): UseTaxReturn => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await taxService.getTaxes();
        if (response.success) {
          setTaxes(response.data);
        } else {
          setError('Failed to fetch taxes');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch taxes');
      } finally {
        setLoading(false);
      }
    };

    fetchTaxes();
  }, []);

  return {
    taxes,
    loading,
    error,
  };
};
