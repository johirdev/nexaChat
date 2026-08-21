"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import {
  AuthUser,
  clearAuthSession,
  getAccessToken,
  saveAuthToken,
} from "@/src/lib/auth";

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  loginUser: (token: string) => void;
  getToken: () => string | null;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  loginUser: () => {},
  getToken: () => null,
  logOut: () => {},
});

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => {
    return getAccessToken();
  };

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      const cookieToken = getAccessToken();

      if (!cookieToken) {
        if (active) {
          setLoading(false);
          router.replace("/login");
        }
        return;
      }

      try {
        const response = await api.get<AuthUser | { user: AuthUser }>("/auth/me");
        const currentUser = "user" in response.data ? response.data.user : response.data;

        if (active) {
          setToken(cookieToken);
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Session validation failed:", error);
        clearAuthSession();

        if (active) {
          setToken(null);
          setUser(null);
          router.replace("/login");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, [router]);

  // Login
  const loginUser = (newToken: string) => {
    if (!newToken || typeof newToken !== "string") {
      console.error("Invalid token");
      return;
    }

    saveAuthToken(newToken);
    setToken(newToken);
  };

  // Logout
  const logOut = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    router.replace("/login");
  };

  const value = {
    token,
    user,
    loading,
    loginUser,
    getToken,
    logOut,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
