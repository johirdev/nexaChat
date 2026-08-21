"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/src/lib/api";
import {
  AuthUser,
  clearAuthSession,
  getAccessToken,
  saveAuthToken,
} from "@/src/lib/auth";
import BrandLoader from "@/src/app/components/Brand/BrandLoader";

/**
 * How long the branded screen stays up before a signed-out visitor is sent to
 * /login. Long enough to read what is happening, short enough not to feel like
 * a wait — an instant bounce reads as a glitch rather than a decision.
 */
const REDIRECT_HOLD_MS = 900;

type SessionStatus = "checking" | "authed" | "guest";

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  /** True while the cookie is still being validated against /auth/me. */
  loading: boolean;
  status: SessionStatus;
  loginUser: (token: string) => void;
  getToken: () => string | null;
  logOut: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  status: "checking",
  loginUser: () => {},
  getToken: () => null,
  logOut: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Guarded areas (the dashboard) hold rendering behind the branded loader and
   * send visitors without a valid session to /login.
   *
   * Public pages pass `false`: they still learn who is signed in — the navbar
   * needs it — but a signed-out visitor must be able to read the landing page
   * rather than being bounced to the login form.
   */
  requireAuth?: boolean;
}

interface SessionState {
  status: SessionStatus;
  token: string | null;
  user: AuthUser | null;
}

const INITIAL: SessionState = { status: "checking", token: null, user: null };

export default function AuthProvider({
  children,
  requireAuth = true,
}: AuthProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<SessionState>(INITIAL);

  const getToken = useCallback(() => getAccessToken(), []);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      const cookieToken = getAccessToken();

      if (!cookieToken) {
        if (active) setSession({ status: "guest", token: null, user: null });
        return;
      }

      try {
        const response = await api.get<AuthUser | { user: AuthUser }>("/auth/me");
        const currentUser =
          "user" in response.data ? response.data.user : response.data;

        if (active) {
          setSession({ status: "authed", token: cookieToken, user: currentUser });
        }
      } catch {
        // The cookie is present but no longer valid — drop it either way.
        clearAuthSession();
        if (active) setSession({ status: "guest", token: null, user: null });
      }
    };

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  // Guarded areas bounce a guest to /login, but only after the loader has been
  // on screen long enough to explain itself.
  useEffect(() => {
    if (!requireAuth || session.status !== "guest") return;

    const timer = window.setTimeout(
      () => router.replace("/login"),
      REDIRECT_HOLD_MS,
    );
    return () => window.clearTimeout(timer);
  }, [requireAuth, session.status, router]);

  const loginUser = useCallback((newToken: string) => {
    if (!newToken) return;
    saveAuthToken(newToken);
    setSession((current) => ({ ...current, status: "authed", token: newToken }));
  }, []);

  const logOut = useCallback(() => {
    clearAuthSession();
    setSession({ status: "guest", token: null, user: null });
    router.replace("/login");
  }, [router]);

  const value: AuthContextType = {
    token: session.token,
    user: session.user,
    loading: session.status === "checking",
    status: session.status,
    loginUser,
    getToken,
    logOut,
  };

  // Only a guarded area waits. Blocking a public page behind a session check
  // would put a spinner in front of every first-time visitor.
  if (requireAuth && session.status === "checking") {
    return <BrandLoader message="Checking your session…" />;
  }

  if (requireAuth && session.status === "guest") {
    return (
      <BrandLoader
        message="You are not signed in yet"
        note="Taking you to the sign-in page…"
      />
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
