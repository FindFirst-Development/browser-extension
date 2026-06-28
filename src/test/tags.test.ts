import { beforeEach, describe, expect, it } from "vitest";

// Pure tag-chip logic extracted for testing
class TagChipState {
  tags: string[] = [];

  add(raw: string): boolean {
    const tag = raw.trim().replace(/,$/, "").trim();
    if (!tag || this.tags.includes(tag)) return false;
    this.tags.push(tag);
    return true;
  }

  remove(index: number) {
    this.tags.splice(index, 1);
  }

  removeLast() {
    this.tags.pop();
  }
}

describe("TagChipState", () => {
  let state: TagChipState;

  beforeEach(() => { state = new TagChipState(); });

  it("adds a tag on Enter", () => {
    state.add("typescript");
    expect(state.tags).toEqual(["typescript"]);
  });

  it("trims trailing comma (comma-key behaviour)", () => {
    state.add("react,");
    expect(state.tags).toEqual(["react"]);
  });

  it("trims whitespace", () => {
    state.add("  node  ");
    expect(state.tags).toEqual(["node"]);
  });

  it("ignores duplicate tags", () => {
    state.add("typescript");
    const added = state.add("typescript");
    expect(added).toBe(false);
    expect(state.tags).toHaveLength(1);
  });

  it("ignores blank input", () => {
    const added = state.add("   ");
    expect(added).toBe(false);
    expect(state.tags).toHaveLength(0);
  });

  it("removes a chip by index", () => {
    state.add("a");
    state.add("b");
    state.add("c");
    state.remove(1);
    expect(state.tags).toEqual(["a", "c"]);
  });

  it("removes last chip on backspace", () => {
    state.add("a");
    state.add("b");
    state.removeLast();
    expect(state.tags).toEqual(["a"]);
  });

  it("backspace on empty list is a no-op", () => {
    expect(() => state.removeLast()).not.toThrow();
    expect(state.tags).toHaveLength(0);
  });
});
