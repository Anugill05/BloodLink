"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api, post, tokens } from "./api";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  acceptSession: (data: { user: User; tokens: { access: string; refresh: string } }) => void;
  logout: () => void;
  reload: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function homeFor(u: User) {
  if (u.hospital) return "/hospital";
  if (u.donor_profile) return "/donor";
  return "/requests";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!tokens.access()) { setUser(null); setLoading(false); return; }
    try {
      setUser(await api<User>("/auth/me/"));
    } catch (e) {
      // Only a real auth failure signs you out — a dropped connection or aborted request must not.
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) { tokens.clear(); setUser(null); }
      else if (!(e instanceof ApiError)) return; // network hiccup: keep loading state, SWR/next action will retry
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const login = async (email: string, password: string) => {
    const t = await post<{ access: string; refresh: string }>("/auth/token/", { email, password });
    tokens.set(t);
    const me = await api<User>("/auth/me/");
    setUser(me);
    return me;
  };

  const acceptSession: AuthCtx["acceptSession"] = ({ user, tokens: t }) => { tokens.set(t); setUser(user); };
  const logout = () => { tokens.clear(); setUser(null); };

  return <Ctx.Provider value={{ user, loading, login, acceptSession, logout, reload }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside AuthProvider");
  return c;
}

/** Redirects to /login when signed out. Returns the user once known. */
export function useRequireAuth(check?: (u: User) => boolean, fallback = "/") {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
    else if (check && !check(user)) router.replace(fallback);
  }, [user, loading, router, check, fallback]);
  return { user: user && (!check || check(user)) ? user : null, loading };
}
