import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionExpiredError, getTags, saveBookmark, signin } from "../shared/api.js";
import { resetStorage } from "./setup.js";

beforeEach(() => resetStorage());
afterEach(() => vi.restoreAllMocks());

describe("signin", () => {
  it("calls POST /user/signin with Basic auth header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 200 })
    );
    await signin("alice", "password123");
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/user/signin");
    expect((init.headers as Record<string, string>)["Authorization"]).toMatch(
      /^Basic /
    );
    expect(init.credentials).toBe("include");
  });

  it("throws on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );
    await expect(signin("alice", "wrong")).rejects.toThrow("401");
  });
});

describe("saveBookmark", () => {
  it("calls POST /api/bookmark and returns bookmark", async () => {
    const bookmark = { id: 1, url: "https://example.com", title: "Example", tags: [] };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(bookmark), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      })
    );
    const result = await saveBookmark("https://example.com", "Example", []);
    expect(result).toEqual(bookmark);
  });

  it("throws SessionExpiredError on 401", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );
    await expect(saveBookmark("https://example.com", "X", [])).rejects.toBeInstanceOf(
      SessionExpiredError
    );
  });

  it("throws on other non-ok responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 409 })
    );
    await expect(saveBookmark("https://example.com", "X", [])).rejects.toThrow();
  });
});

describe("getTags", () => {
  it("returns tag names from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([{ id: 1, name: "typescript" }, { id: 2, name: "react" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const tags = await getTags();
    expect(tags).toEqual(["typescript", "react"]);
  });

  it("returns empty array on non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 500 })
    );
    const tags = await getTags();
    expect(tags).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network"));
    const tags = await getTags();
    expect(tags).toEqual([]);
  });

  it("re-throws SessionExpiredError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 401 })
    );
    await expect(getTags()).rejects.toBeInstanceOf(SessionExpiredError);
  });
});
