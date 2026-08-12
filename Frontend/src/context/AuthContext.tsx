import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  getProfile,
  loginUser,
  registerUser,
  setUnauthorizedHandler,
  tokenStore,
  type AuthUser,
} from "@/lib/api";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string, remember?: boolean) => Promise<void>;
  register: (payload: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setToken(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      if (profile && (profile.username || profile.email)) {
        setUser(profile);
        tokenStore.saveUser(profile);
      }
    } catch {
      /* profile endpoint optional */
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });
    const existing = tokenStore.access();
    if (existing) {
      setToken(existing);
      setUser(tokenStore.user());
      void refreshProfile();
    }
    setReady(true);
  }, [refreshProfile]);

  const login = useCallback(
    async (username: string, password: string, remember = true) => {
      const result = await loginUser({ username, password });
      if (!result.access) throw new Error("Login response did not include an access token.");
      tokenStore.save(result.access, result.refresh, result.user, remember);
      setToken(result.access);
      setUser(result.user);
      void refreshProfile();
    },
    [refreshProfile],
  );

  const register = useCallback(
    async (payload: { username: string; email: string; password: string; password2: string }) => {
      await registerUser(payload);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      ready,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, ready, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
