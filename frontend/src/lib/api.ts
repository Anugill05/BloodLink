"use client";

const ACCESS = "bl.access";
const REFRESH = "bl.refresh";

export class ApiError extends Error {
  constructor(public status: number, public data: unknown) {
    super(ApiError.describe(data) || `Request failed (${status})`);
  }
  static describe(data: unknown): string {
    if (!data || typeof data !== "object") return "";
    const d = data as Record<string, unknown>;
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(data)) return String(data[0]);
    const [k, v] = Object.entries(d)[0] ?? [];
    if (!k) return "";
    const msg = Array.isArray(v) ? v[0] : typeof v === "object" ? ApiError.describe(v) : v;
    return k === "non_field_errors" ? String(msg) : `${k.replace(/_/g, " ")}: ${msg}`;
  }
  /** field → first message, for inline form errors */
  get fields(): Record<string, string> {
    const out: Record<string, string> = {};
    if (this.data && typeof this.data === "object" && !Array.isArray(this.data)) {
      for (const [k, v] of Object.entries(this.data as Record<string, unknown>)) out[k] = Array.isArray(v) ? String(v[0]) : String(v);
    }
    return out;
  }
}

const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string | null) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* private mode */ } },
};

export const tokens = {
  access: () => store.get(ACCESS),
  set(t: { access: string; refresh: string }) { store.set(ACCESS, t.access); store.set(REFRESH, t.refresh); },
  clear() { store.set(ACCESS, null); store.set(REFRESH, null); },
};

let refreshing: Promise<boolean> | null = null;
async function refresh(): Promise<boolean> {
  const r = store.get(REFRESH);
  if (!r) return false;
  refreshing ??= fetch("/api/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: r }),
  })
    .then(async (res) => {
      if (!res.ok) { tokens.clear(); return false; }
      const t = await res.json();
      tokens.set({ access: t.access, refresh: t.refresh ?? r });
      return true;
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const access = tokens.access();
  if (access) headers.set("Authorization", `Bearer ${access}`);
  let body = init.body;
  if (init.json !== undefined) { headers.set("Content-Type", "application/json"); body = JSON.stringify(init.json); }
  const res = await fetch(`/api${path}`, { ...init, headers, body });
  if (res.status === 401 && retry && (await refresh())) return api<T>(path, init, false);
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export const post = <T,>(path: string, json: unknown = {}) => api<T>(path, { method: "POST", json });
export const patch = <T,>(path: string, json: unknown) => api<T>(path, { method: "PATCH", json });
export const fetcher = <T,>(path: string) => api<T>(path);
