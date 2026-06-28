import { clearAuth, getAccessToken, getServerUrl } from "./storage.js";

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
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(input, { ...init, headers });
  if (response.status === 401) {
    await clearAuth();
    throw new SessionExpiredError();
  }
  return response;
}

export async function signin(
  username: string,
  password: string
): Promise<string> {
  const serverUrl = await getServerUrl();
  const credentials = btoa(`${username}:${password}`);
  const response = await fetch(`${serverUrl}/user/signin`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });
  if (!response.ok) {
    throw new Error(`signin failed: ${response.status}`);
  }
  const body = (await response.json()) as { accessToken?: string };
  const accessToken = body.accessToken;
  if (!accessToken) {
    throw new Error("signin response missing accessToken");
  }
  return accessToken;
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
    // TODO(r-sandor) we need add a toggle to the extension for scrapable.
    // defaulting to to true.
    body: JSON.stringify({ url, title, tags, scapable: true }),
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
