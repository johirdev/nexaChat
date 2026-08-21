/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// ================= TYPES =================
interface AdminData {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

export interface AuthContextType {
  token: string | null;
  adminData: AdminData | null;
  loading: boolean;
  loginAdmin: (token: string) => void;
  logOut: () => void;
}

// ================= CONTEXT =================
export const AuthContext = createContext<AuthContextType>({
  token: null,
  adminData: null,
  loading: true,
  loginAdmin: () => {},
  logOut: () => {},
});

// ================= PROVIDER =================
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  // ================= INIT AUTH =================
  useEffect(() => {
    const initAuth = () => {
      try {
        const cookieToken = Cookies.get("access_token");

        if (cookieToken) {
          const decoded = jwtDecode<AdminData>(cookieToken);
          // optional: check token expiry
          if (decoded?.exp && decoded.exp * 1000 < Date.now()) {
            Cookies.remove("access_token");
            setToken(null);
            setAdminData(null);
          } else {
            setToken(cookieToken);
            setAdminData(decoded);
          }
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        Cookies.remove("access_token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ================= LOGIN =================
 const loginAdmin = (newToken: string) => {
   try {

     if (!newToken || typeof newToken !== "string") {
       console.error("Invalid token");
       return;
     }

    Cookies.set("access_token", newToken, {
      expires: 1,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

     setToken(newToken);
     setAdminData(jwtDecode(newToken));
   } catch (err) {
     console.error("Cookie set failed:", err);
   }
 };

  // ================= LOGOUT =================
  const logOut = () => {
    Cookies.remove("access_token", { path: "/" });
    setToken(null);
    setAdminData(null);
  };

  // ================= MEMO VALUE =================
  const value = useMemo(
    () => ({
      token,
      adminData,
      loading,
      loginAdmin,
      logOut,
    }),
    [token, adminData, loading]
  );

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}