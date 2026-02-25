import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseFetchResult<T, F> {
  data: T | null;
  formattedData?: F;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function useFetch<T = unknown, F = unknown>({
  url,
  options,
  onFetched,
  formatter,
  baseUrl,
}: {
  url: string;
  options?: RequestInit & { skip?: boolean };
  onFetched?: (data: T | null) => void;
  formatter?: (data: T) => F;
  baseUrl?: string;
}): UseFetchResult<T, F> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);
  // const fetchData = async () => {
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const finalBase = baseUrl || config.apiDomain;
      const fullUrl = url.startsWith("http") ? url : `${finalBase}${url}`;
      const res = await appFetch(fullUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        ...options,
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
      if (onFetched) {
        onFetched(json);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
      if (onFetched) {
        onFetched(null);
      }
    } finally {
      setLoading(false);
    }
  }, [url, baseUrl, options, onFetched]);

  useEffect(() => {
    if (options?.skip) return;
    fetchData();
  }, [url, reloadFlag, options?.skip]);

  const refetch = () => setReloadFlag((f) => f + 1);

  const formattedData = useMemo(() => {
    if (formatter && data) {
      return formatter(data);
    } else {
      return undefined;
    }
  }, [data, formatter]);

  return { data, loading, error, formattedData, refetch };
}

export default useFetch;
