import { SessionExpiredError, getTags, saveBookmark, signin } from "../shared/api.js";
import type {
  GetAuthStateResponse,
  GetTagsResponse,
  Message,
  SaveBookmarkResponse,
  SignInResponse,
  SignOutResponse,
} from "../shared/messages.js";
import {
  clearAuth,
  getAuthState,
  setAuthenticated,
} from "../shared/storage.js";

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "save-to-findfirst",
    title: "Save to FindFirst",
    contexts: ["page", "link"],
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  const { isAuthenticated } = await getAuthState();

  if (!isAuthenticated) {
    await browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-48.png",
      title: "FindFirst",
      message: "Sign in to FindFirst to save bookmarks.",
    });
    return;
  }

  const url = info.linkUrl ?? tab?.url ?? "";
  const title = info.linkText?.trim() || info.linkUrl || tab?.title || url;

  try {
    await saveBookmark(url, title, []);
    await browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-48.png",
      title: "FindFirst",
      message: `Saved: ${title}`,
    });
  } catch (e) {
    const message =
      e instanceof SessionExpiredError
        ? "Session expired. Please sign in again."
        : "Failed to save bookmark.";
    await browser.notifications.create({
      type: "basic",
      iconUrl: "icons/icon-48.png",
      title: "FindFirst",
      message,
    });
  }
});

browser.runtime.onMessage.addListener(
  (rawMessage: unknown, _sender, sendResponse) => {
    const message = rawMessage as Message;
    handleMessage(message).then(sendResponse).catch((e: unknown) => {
      sendResponse({ ok: false, error: String(e) });
    });
    return true; // keep message channel open for async response
  }
);

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case "SIGN_IN": {
      try {
        const accessToken = await signin(message.username, message.password);
        await setAuthenticated(message.username, accessToken);
        return { ok: true, username: message.username } satisfies SignInResponse;
      } catch {
        return { ok: false, error: "Invalid credentials" } satisfies SignInResponse;
      }
    }

    case "SIGN_OUT": {
      await clearAuth();
      return { ok: true } satisfies SignOutResponse;
    }

    case "SAVE_BOOKMARK": {
      try {
        await saveBookmark(message.url, message.title, message.tags);
        return { ok: true } satisfies SaveBookmarkResponse;
      } catch (e) {
        const error =
          e instanceof SessionExpiredError ? "session_expired" : String(e);
        return { ok: false, error } satisfies SaveBookmarkResponse;
      }
    }

    case "GET_TAGS": {
      const tags = await getTags();
      return { tags } satisfies GetTagsResponse;
    }

    case "GET_AUTH_STATE": {
      const state = await getAuthState();
      return {
        isAuthenticated: state.isAuthenticated,
        username: state.username,
      } satisfies GetAuthStateResponse;
    }
  }
}
