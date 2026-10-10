"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { tokenStore } from "@/lib/api";

type AuthState = {
  email: string | null;
  ready: boolean; // false until localStorage has been read on the client
  login: (token: string, email: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthState>({ email: null, ready: false, login() {}, logout() {} });
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEmail(tokenStore.get() ? tokenStore.email() : null);
    setReady(true);
  }, []);

  // Stable function identities so pages can safely list them as effect dependencies
  const login = useCallback((token: string, e: string) => { tokenStore.set(token, e); setEmail(e); }, []);
  const logout = useCallback(() => { tokenStore.clear(); setEmail(null); }, []);
  const value = useMemo(() => ({ email, ready, login, logout }), [email, ready, login, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
