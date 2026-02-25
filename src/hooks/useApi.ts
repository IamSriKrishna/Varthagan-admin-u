import { useState, useCallback } from "react";
import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutateApi: (body?: unknown, customUrl?: string) => Promise<T | void>;
  BaseUrl?: string;
}

const API_DOMAIN = config.apiDomain || "";

function useApi<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  options?: RequestInit,
  customBaseUrl?: string,
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mutateApi = useCallback(
    async (body?: unknown, customUrl?: string) => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = customBaseUrl || API_DOMAIN;
        const fullUrl = (customUrl || url).startsWith("http") ? customUrl || url : `${baseUrl}${customUrl || url}`;

        const res = await appFetch(fullUrl, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
          },

          body: body ? JSON.stringify(body) : undefined,
          ...options,
        });
        const isJson = res.headers.get("content-type")?.includes("application/json");

        const responseBody = isJson ? await res.json() : await res.text();

        if (!res.ok) {
          const message = typeof responseBody === "string" ? responseBody : responseBody?.message || "Request failed";
          throw {
            message,
            fullError: responseBody,
            status: res.status,
          };
        }

        setData(responseBody);
        return responseBody;
      } catch (err: unknown) {
        const errormessage = err as { message?: string; fullError?: { message?: string }; status?: number };

        const message = errormessage?.fullError?.message || errormessage?.message || "Something went wrong.";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, method, options, customBaseUrl],
  );

  return { data, loading, error, mutateApi };
}

export default useApi;
