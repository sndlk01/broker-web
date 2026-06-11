import { AUTH_TOKEN_KEY } from "./auth-token";

export { AUTH_TOKEN_KEY };

const USER_EMAIL_KEY = "broker-web-user-email";

const AUTH_TOKEN_CHANGE_EVENT = "broker-web-auth-token-change";

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(
    token,
  )}; path=/; max-age=604800; SameSite=Lax`;
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function saveUserEmail(email: string) {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function getUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const localToken = localStorage.getItem(AUTH_TOKEN_KEY);

  if (localToken) {
    return localToken;
  }

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_TOKEN_KEY}=`))
    ?.split("=")[1];

  return cookieToken ? decodeURIComponent(cookieToken) : null;
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export function subscribeAuthToken(listener: () => void) {
  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
