export interface AuthState {
  serverUrl: string;
  isAuthenticated: boolean;
  username: string | null;
}

const DEFAULT_SERVER_URL = "http://localhost:8080";

export async function getAuthState(): Promise<AuthState> {
  const result = await browser.storage.local.get([
    "serverUrl",
    "isAuthenticated",
    "username",
  ]);
  return {
    serverUrl: (result["serverUrl"] as string) ?? DEFAULT_SERVER_URL,
    isAuthenticated: (result["isAuthenticated"] as boolean) ?? false,
    username: (result["username"] as string) ?? null,
  };
}

export async function setAuthenticated(username: string): Promise<void> {
  await browser.storage.local.set({ isAuthenticated: true, username });
}

export async function clearAuth(): Promise<void> {
  await browser.storage.local.remove(["isAuthenticated", "username"]);
}

export async function setServerUrl(url: string): Promise<void> {
  await browser.storage.local.set({ serverUrl: url });
}

export async function getServerUrl(): Promise<string> {
  const result = await browser.storage.local.get("serverUrl");
  return (result["serverUrl"] as string) ?? DEFAULT_SERVER_URL;
}
