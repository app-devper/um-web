"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import type { LoginRequest, LoginResponse, User } from "@/types";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const clearKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const startKeepAlive = useCallback(() => {
    clearKeepAlive();
    keepAliveRef.current = setInterval(async () => {
      try {
        const res = await api.get<LoginResponse>("/auth/keep-alive");
        const newToken = res.data.accessToken;
        sessionStorage.setItem("accessToken", newToken);
        setToken(newToken);
      } catch {
        clearKeepAlive();
        sessionStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      }
    }, 4 * 60 * 1000); // every 4 minutes
  }, [clearKeepAlive]);

  const fetchCurrentUser = useCallback(async () => {
    const res = await api.get<User>("/user/info");
    setUser(res.data);
    return res.data;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      await fetchCurrentUser();
    } catch {
      setUser(null);
    }
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (req: LoginRequest) => {
      const res = await api.post<LoginResponse>("/auth/login", req);
      const accessToken = res.data.accessToken;
      sessionStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
      let loggedInUser: User;
      try {
        loggedInUser = await fetchCurrentUser();
      } catch {
        sessionStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
        throw new Error("failed to bootstrap user");
      }
      startKeepAlive();
      router.push(loggedInUser.role === "USER" ? "/profile" : "/users");
    },
    [fetchCurrentUser, startKeepAlive, router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    clearKeepAlive();
    sessionStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [clearKeepAlive, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem("accessToken");
    if (stored) {
      setToken(stored);
      api
        .get<User>("/user/info")
        .then((res) => {
          setUser(res.data);
          startKeepAlive();
        })
        .catch(() => {
          sessionStorage.removeItem("accessToken");
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    return () => clearKeepAlive();
  }, [startKeepAlive, clearKeepAlive]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
