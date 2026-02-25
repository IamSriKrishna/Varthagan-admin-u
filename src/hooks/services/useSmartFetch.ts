// import { useQuery } from "@tanstack/react-query";
// import { config } from "@/config";
// import { appFetch } from "@/utils/fetchInterceptor";
// import useFetch from "../useFetch";

// interface UseSmartFetchProps<T, F> {
//   url: string;
//   options?: RequestInit & { skip?: boolean };
//   onFetched?: (data: T | null) => void;
//   formatter?: (data: T) => F;
//   baseUrl?: string;
//   isCaching?: boolean;
// }

// export function useSmartFetch<T = unknown, F = unknown>({
//   url,
//   options,
//   onFetched,
//   formatter,
//   baseUrl,
//   isCaching = false,
// }: UseSmartFetchProps<T, F>) {
//   if (isCaching) {
//     const query = useQuery({
//       queryKey: [url],
//       enabled: !options?.skip,
//       queryFn: async () => {
//         const finalBase = baseUrl || config.apiDomain;
//         const fullUrl = url.startsWith("http") ? url : `${finalBase}${url}`;

//         const res = await appFetch(fullUrl, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             ...(options?.headers || {}),
//           },
//           ...options,
//         });

//         if (!res.ok) {
//           throw new Error(await res.text());
//         }

//         const json = await res.json();
//         onFetched?.(json);

//         return formatter ? formatter(json) : json;
//       },
//     });

//     return {
//       data: query.data ?? null,
//       formattedData: query.data,
//       loading: query.isLoading,
//       error: query.error instanceof Error ? query.error.message : null,
//       refetch: query.refetch,
//     };
//   }

//   return useFetch<T, F>({
//     url,
//     options,
//     onFetched,
//     formatter,
//     baseUrl,
//   });
// }
import { useQuery } from "@tanstack/react-query";
import { config } from "@/config";
import { appFetch } from "@/utils/fetchInterceptor";
import useFetch from "../useFetch";

interface UseSmartFetchProps<T, F> {
  url: string;
  options?: RequestInit & { skip?: boolean };
  onFetched?: (data: T | null) => void;
  formatter?: (data: T) => F;
  baseUrl?: string;
  isCaching?: boolean;
}

export function useSmartFetch<T = unknown, F = unknown>({
  url,
  options,
  onFetched,
  formatter,
  baseUrl,
  isCaching = false,
}: UseSmartFetchProps<T, F>) {
  const query = useQuery({
    queryKey: [url],
    enabled: isCaching && !options?.skip,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
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
      onFetched?.(json);
      return formatter ? formatter(json) : json;
    },
    refetchOnMount: false,
  });

  const normalFetch = useFetch<T, F>({
    url,
    options,
    onFetched,
    formatter,
    baseUrl,
  });

  if (isCaching) {
    return {
      data: (query.data as T) ?? null,
      formattedData: query.data as F,
      loading: query.isLoading,
      fetching: query.isFetching,
      error: query.error instanceof Error ? query.error.message : null,
      refetch: query.refetch,
      source: query.isFetching ? "api" : "cache",
    };
  }

  return {
    ...normalFetch,
    fetching: false,
    source: "api",
  };
}
