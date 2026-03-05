const ACCESS_TOKEN_KEY = "admin_access_token";
const OAUTH_STATE_KEY = "oauth_state";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function saveOAuthState(state: string): void {
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
}

export function getOAuthState(): string | null {
  return sessionStorage.getItem(OAUTH_STATE_KEY);
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

export function buildGitHubOAuthUrl(state: string): string {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID ?? "";
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${adminUrl}/callback`,
    scope: "read:user",
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}
