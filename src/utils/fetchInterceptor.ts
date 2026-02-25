// Minimal wrapper that delegates to the global fetch so existing call sites
// don't need to change. Use `appFetch(input, init)` just like `fetch`.
import { usermangement } from "@/constants/apiConstants";
import { localStorageAuthKey } from "@/constants/localStorageConstant";
import { LoginResponse } from "@/models/IUser";
import { logout, setAuthData } from "@/store/auth/authSlice";

export class FetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FetchError";
    this.status = status;
  }
}

let inflightRefresh: Promise<LoginResponse | null> | null = null;
function getStoredAuth(): LoginResponse | null {
  const persistedRoot = localStorage.getItem(localStorageAuthKey) ?? null;
  if (!persistedRoot) return null;

  try {
    const rootData = JSON.parse(persistedRoot);
    if (!rootData.auth) return null;

    const authData = JSON.parse(rootData.auth) as LoginResponse;
    // console.log("Stored Auth Data:", authData);
    return authData;
  } catch (e) {
    console.error("Failed to parse persisted auth:", e);
    return null;
  }
}

async function getStore() {
  const { store } = await import("@/store");
  return store;
}
async function performRefresh(stored: LoginResponse | null): Promise<LoginResponse> {
  const refreshToken = stored?.refresh_token;
  if (!refreshToken) throw new Error("no-refresh-token");

  const refreshDomain = process.env.NEXT_PUBLIC_LOGIN_DOMAIN ?? "";
  const refreshUrl = `${refreshDomain.replace(/\/$/, "")}${usermangement.refreshToken}`;

  const r = await fetch(refreshUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${stored?.access_token || ""}`,
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!r.ok) throw new Error("refresh-failed");
  const data = (await r.json()) as LoginResponse;
  const store = await getStore();
  store.dispatch(setAuthData(data));
  return data;
}

async function handleRefreshFlow(): Promise<LoginResponse | null> {
  const stored = getStoredAuth();
  if (!stored?.refresh_token) throw new Error("no-refresh-token");

  if (!inflightRefresh) {
    inflightRefresh = performRefresh(stored).catch((e) => {
      inflightRefresh = null;
      throw e;
    });
  }

  const result = await inflightRefresh;
  inflightRefresh = null;
  return result;
}

function retryRequestWithToken(input: RequestInfo, init: RequestInit | undefined, accessToken: string) {
  const newInit: RequestInit = {
    ...(init || {}),
    headers: {
      ...(init?.headers as HeadersInit),
      Authorization: `Bearer ${accessToken}`,
    },
  };
  return fetch(input, newInit);
}

async function handleLogoutAndRedirect() {
  try {
    const store = await getStore();
    const { persistor } = await import("@/store");
    const { clearVendors, setSelectedVendor } = await import("@/store/vendors/vendorsSlice");
    store.dispatch(logout());
    persistor.purge();
    store.dispatch(clearVendors());
    store.dispatch(setSelectedVendor(null));
  } catch {}
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
}

function requestHasAuthorization(init: RequestInit | undefined, input: RequestInfo): boolean {
  // check init.headers
  const headers = init?.headers;
  if (headers) {
    if (headers instanceof Headers) {
      return !!headers.get("Authorization") || !!headers.get("authorization");
    }
    if (Array.isArray(headers)) {
      for (const [k] of headers as Array<[string, string]>) {
        if (k.toLowerCase() === "authorization") return true;
      }
    } else if (typeof headers === "object") {
      for (const k of Object.keys(headers as Record<string, unknown>)) {
        if (k.toLowerCase() === "authorization") return true;
      }
    }
  }

  // if input is a Request, check its headers
  try {
    if (typeof input !== "string") {
      const req = input as Request;
      if (req?.headers) return !!req.headers.get("Authorization") || !!req.headers.get("authorization");
    }
  } catch {}

  return false;
}

// Build headers for fetch: preserve caller headers but attach Authorization
// from Redux store when the caller didn't provide one.
async function getFetchHeaders(input: RequestInfo, init?: RequestInit, skipAuth?: boolean): Promise<HeadersInit> {
  if (skipAuth) {
    return init?.headers ? { ...(init.headers as Record<string, string>) } : {};
  }

  const store = await getStore();
  const state = store.getState();
  const token = state?.auth?.access_token || "";

  // Debug logging for token issues
  if (!token) {
    const stored = getStoredAuth();
    if (stored?.access_token) {
      console.warn("Token not in Redux but exists in localStorage. Re-initializing...");
      store.dispatch(setAuthData(stored));
    } else {
      console.warn("No authentication token available");
    }
  }

  const originalHeaders = init?.headers;

  // if caller already provided Authorization, leave headers untouched
  if (requestHasAuthorization(init, input)) return (originalHeaders as HeadersInit) || {};

  if (!originalHeaders) return token ? { Authorization: `Bearer ${token}` } : {};

  if (originalHeaders instanceof Headers) {
    const nh = new Headers(originalHeaders as Headers);
    if (token) nh.set("Authorization", `Bearer ${token}`);
    return nh;
  }

  if (Array.isArray(originalHeaders)) {
    const arr = (originalHeaders as Array<[string, string]>).slice();
    if (token) arr.push(["Authorization", `Bearer ${token}`]);
    return arr as unknown as HeadersInit;
  }

  const obj = { ...(originalHeaders as Record<string, string>) };
  if (token) obj["Authorization"] = `Bearer ${token}`;
  return obj as HeadersInit;
}

export const appFetch = async (input: RequestInfo, init?: RequestInit & { skipAuth?: boolean }): Promise<Response> => {
  const fetchInit: RequestInit = {
    ...(init || {}),
    headers: await getFetchHeaders(input, init, init?.skipAuth),
  };
  const res = await fetch(input, fetchInit);

  const isAuthRequest = typeof input === "string" && (input.includes("/auth/login") || input.includes("/auth/refresh"));

  if (res.status !== 401 || init?.skipAuth || isAuthRequest) {
    return res;
  }

  try {
    const newAuth = await handleRefreshFlow();
    const stored = getStoredAuth();
    const accessToken = newAuth?.access_token || stored?.access_token || "";

    if (!accessToken) {
      console.debug("No access token available after refresh");
      handleLogoutAndRedirect();
      throw new FetchError("Unauthorized", 401);
    }

    return retryRequestWithToken(input, fetchInit, accessToken);
  } catch (err) {
    console.debug("Refresh failed, redirecting to login:", err);
    handleLogoutAndRedirect();
    throw new FetchError("Unauthorized", 401);
  }
};
