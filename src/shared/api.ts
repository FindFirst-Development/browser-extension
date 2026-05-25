import { clearAuth, getJwtToken, getServerUrl, setJwtToken } from "./storage.js";

export class SessionExpiredError extends Error {
  constructor() {
    super("session_expired");
    this.name = "SessionExpiredError";
  }
}

export interface Bookmark {
  id: number;
  url: string;
  title: string;
  tags: string[];
}

export interface Tag {
  id: number;
  name: string;
}

async function fetchWithAuth(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getJwtToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    await clearAuth();
    throw new SessionExpiredError();
  }
  return response;
}

export async function signin(username: string, password: string): Promise<void> {
  const serverUrl = await getServerUrl();
  const credentials = btoa(`${username}:${password}`);
  const response = await fetch(`${serverUrl}/user/signin`, {
    method: "POST",
    credentials: "include",
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!response.ok) {
    throw new Error(`signin failed: ${response.status}`);
  }
  // Cookies from cross-origin extension fetches aren't reliably sent in Chrome.
  // Read the JWT via the cookies API and store it for explicit Bearer auth.
  const cookie = await browser.cookies.get({ url: serverUrl, name: "findfirst" });
  if (cookie) {
    await setJwtToken(cookie.value);
  }
}

export async function saveBookmark(
  url: string,
  title: string,
  tags: string[]
): Promise<Bookmark> {
  const serverUrl = await getServerUrl();
  const response = await fetchWithAuth(`${serverUrl}/api/bookmark`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title, tags }),
  });
  if (!response.ok) {
    throw new Error(`saveBookmark failed: ${response.status}`);
  }
  return response.json() as Promise<Bookmark>;
}

export async function getTags(): Promise<string[]> {
  const serverUrl = await getServerUrl();
  try {
    const response = await fetchWithAuth(`${serverUrl}/api/tags`);
    if (!response.ok) return [];
    const tags = (await response.json()) as Tag[];
    return tags.map((t) => t.name);
  } catch (e) {
    if (e instanceof SessionExpiredError) throw e;
    return [];
  }
}
