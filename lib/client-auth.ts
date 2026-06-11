import { AUTH_TOKEN_KEY } from "./auth-token";

export { AUTH_TOKEN_KEY };

const AUTH_TOKEN_CHANGE_EVENT = "broker-web-auth-token-change";

export function saveAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  document.cookie = `${AUTH_TOKEN_KEY}=${encodeURIComponent(
    token,
  )}; path=/; max-age=604800; SameSite=Lax`;
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGE_EVENT));
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
