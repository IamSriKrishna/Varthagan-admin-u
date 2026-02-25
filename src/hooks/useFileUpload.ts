import { useState } from "react";
import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";

interface UseFileUploadResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  uploadFile: (
    file: Blob | File | ArrayBuffer,
    uploadUrl: string,
    contentType?: string,
    overrideToken?: string,
    customBaseUrl?: string,
  ) => Promise<T | string | void>;
}

function useFileUpload<T = unknown>(): UseFileUploadResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: Blob | File | ArrayBuffer,
    uploadUrl: string,
    contentType = "application/octet-stream",
    overrideToken?: string,
    customBaseUrl?: string,
  ): Promise<T | string | void> => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = customBaseUrl || config.apiDomain;
      const fullUrl = uploadUrl.startsWith("http") ? uploadUrl : `${baseUrl}${uploadUrl}`;

      const headers: HeadersInit = {
        "Content-Type": contentType,
      };

      if (overrideToken) {
        headers["Authorization"] = `Bearer ${overrideToken}`;
      }

      const res = await appFetch(fullUrl, {
        method: "PUT",
        headers,
        body: file,
        skipAuth: !overrideToken,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      const contentTypeRes = res.headers.get("content-type");
      const result = contentTypeRes?.includes("application/json") ? await res.json() : await res.text();

      setData(result as T);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, uploadFile };
}

export default useFileUpload;
