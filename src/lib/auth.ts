import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

export const ACCESS_TOKEN_COOKIE = "access_token";

export interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface JwtPayload {
  exp?: number;
}

export function saveAuthSession(response: LoginResponse) {
  if (!response.token) {
    throw new Error("The authentication response did not include a token.");
  }

  saveAuthToken(response.token);
}

export function saveAuthToken(token: string) {
  if (!token) {
    throw new Error("The authentication response did not include a token.");
  }

  const decoded = jwtDecode<JwtPayload>(token);
  const expires = decoded.exp
    ? Math.max((decoded.exp * 1000 - Date.now()) / 86_400_000, 0)
    : 1;

  Cookies.set(ACCESS_TOKEN_COOKIE, token, {
    expires,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN_COOKIE) ?? null;
}

export function clearAuthSession() {
  Cookies.remove(ACCESS_TOKEN_COOKIE, { path: "/" });
}