import { describe, expect, it } from "vitest";

// Inline the same validation function used in options.ts
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

describe("isValidUrl", () => {
  it("accepts http URLs", () => {
    expect(isValidUrl("http://localhost:8080")).toBe(true);
    expect(isValidUrl("http://findfirst.example.com")).toBe(true);
  });

  it("accepts https URLs", () => {
    expect(isValidUrl("https://findfirst.example.com")).toBe(true);
  });

  it("rejects bare hostnames", () => {
    expect(isValidUrl("localhost:8080")).toBe(false);
    expect(isValidUrl("findfirst.example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });

  it("rejects non-http protocols", () => {
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("file:///etc/passwd")).toBe(false);
    expect(isValidUrl("javascript:alert(1)")).toBe(false);
  });

  it("rejects plain text", () => {
    expect(isValidUrl("not a url at all")).toBe(false);
  });
});
