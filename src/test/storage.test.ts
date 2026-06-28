import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAuth,
  getAuthState,
  getServerUrl,
  setAuthenticated,
  setServerUrl,
} from "../shared/storage.js";
import { resetStorage } from "./setup.js";

beforeEach(() => resetStorage());

describe("getAuthState", () => {
  it("returns defaults when storage is empty", async () => {
    const state = await getAuthState();
    expect(state.serverUrl).toBe("http://localhost:8080");
    expect(state.isAuthenticated).toBe(false);
    expect(state.username).toBeNull();
  });
});

describe("setAuthenticated / clearAuth", () => {
  it("sets isAuthenticated and username", async () => {
    await setAuthenticated("alice");
    const state = await getAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.username).toBe("alice");
  });

  it("clearAuth removes isAuthenticated and username", async () => {
    await setAuthenticated("alice");
    await clearAuth();
    const state = await getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.username).toBeNull();
  });
});

describe("setServerUrl / getServerUrl", () => {
  it("persists and reads back the server URL", async () => {
    await setServerUrl("https://findfirst.example.com");
    const url = await getServerUrl();
    expect(url).toBe("https://findfirst.example.com");
  });

  it("returns default when not set", async () => {
    const url = await getServerUrl();
    expect(url).toBe("http://localhost:8080");
  });
});
