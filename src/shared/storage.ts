export interface AuthState {
  serverUrl: string;
  isAuthenticated: boolean;
  username: string | null;
  accessToken: string | null;
}

const DEFAULT_SERVER_URL = "http://localhost:9000";

export async function getAuthState(): Promise<AuthState> {
  const result = await browser.storage.local.get([
    "serverUrl",
    "isAuthenticated",
    "username",
    "accessToken",
  ]);
  return {
    serverUrl: (result["serverUrl"] as string) ?? DEFAULT_SERVER_URL,
    isAuthenticated: (result["isAuthenticated"] as boolean) ?? false,
    username: (result["username"] as string) ?? null,
    accessToken: (result["accessToken"] as string) ?? null,
  };
}

export async function setAuthenticated(
  username: string,
  accessToken: string
): Promise<void> {
  await browser.storage.local.set({ isAuthenticated: true, username, accessToken });
}

export async function clearAuth(): Promise<void> {
  await browser.storage.local.remove(["isAuthenticated", "username", "accessToken"]);
}

export async function setServerUrl(url: string): Promise<void> {
  await browser.storage.local.set({ serverUrl: url });
}

export async function getServerUrl(): Promise<string> {
  const result = await browser.storage.local.get("serverUrl");
  return (result["serverUrl"] as string) ?? DEFAULT_SERVER_URL;
}

export async function getAccessToken(): Promise<string | null> {
  const result = await browser.storage.local.get("accessToken");
  return (result["accessToken"] as string) ?? null;
}
