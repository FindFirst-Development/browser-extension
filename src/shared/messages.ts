export type Message =
  | { type: "SIGN_IN"; username: string; password: string }
  | { type: "SIGN_OUT" }
  | { type: "SAVE_BOOKMARK"; url: string; title: string; tags: string[] }
  | { type: "GET_TAGS" }
  | { type: "GET_AUTH_STATE" };

export type SignInResponse =
  | { ok: true; username: string }
  | { ok: false; error: string };

export type SignOutResponse = { ok: true };

export type SaveBookmarkResponse =
  | { ok: true }
  | { ok: false; error: "session_expired" | string };

export type GetTagsResponse = { tags: string[] };

export type GetAuthStateResponse = {
  isAuthenticated: boolean;
  username: string | null;
};

export type MessageResponse<T extends Message> =
  T extends { type: "SIGN_IN" } ? SignInResponse :
  T extends { type: "SIGN_OUT" } ? SignOutResponse :
  T extends { type: "SAVE_BOOKMARK" } ? SaveBookmarkResponse :
  T extends { type: "GET_TAGS" } ? GetTagsResponse :
  T extends { type: "GET_AUTH_STATE" } ? GetAuthStateResponse :
  never;
