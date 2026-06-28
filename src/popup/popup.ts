import type {
  GetAuthStateResponse,
  GetTagsResponse,
  SaveBookmarkResponse,
  SignInResponse,
  SignOutResponse,
} from "../shared/messages.js";

function send<T>(message: object): Promise<T> {
  return browser.runtime.sendMessage(message) as Promise<T>;
}

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

const viewSignin = el("view-signin");
const viewSave = el("view-save");
const signinNoticeEl = el<HTMLParagraphElement>("signin-notice");
const signinError = el<HTMLParagraphElement>("signin-error");
const formSignin = el<HTMLFormElement>("form-signin");
const inputUsername = el<HTMLInputElement>("input-username");
const inputPassword = el<HTMLInputElement>("input-password");
const btnSignin = el<HTMLButtonElement>("btn-signin");

const formSave = el<HTMLFormElement>("form-save");
const inputTitle = el<HTMLInputElement>("input-title");
const inputUrl = el<HTMLInputElement>("input-url");
const inputTag = el<HTMLInputElement>("input-tag");
const tagChipsEl = el("tag-chips");
const tagSuggestions = el<HTMLUListElement>("tag-suggestions");
const saveError = el<HTMLParagraphElement>("save-error");
const saveSuccess = el<HTMLParagraphElement>("save-success");
const btnSave = el<HTMLButtonElement>("btn-save");
const btnSignout = el<HTMLButtonElement>("btn-signout");
const btnSettings = el<HTMLButtonElement>("btn-settings");
const noBookmarkMsg = el<HTMLParagraphElement>("no-bookmark-msg");

let pendingTags: string[] = [];
let allTags: string[] = [];

function showView(view: "signin" | "save", notice?: string) {
  viewSignin.hidden = view !== "signin";
  viewSave.hidden = view !== "save";
  if (view === "signin" && notice) {
    signinNoticeEl.textContent = notice;
    signinNoticeEl.hidden = false;
  } else {
    signinNoticeEl.hidden = true;
  }
}

function showError(el: HTMLParagraphElement, msg: string) {
  el.textContent = msg;
  el.hidden = false;
}

function clearError(el: HTMLParagraphElement) {
  el.hidden = true;
}

// --- Tag chip logic ---

function renderChips() {
  tagChipsEl.innerHTML = "";
  pendingTags.forEach((tag, i) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = tag;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${tag}`);
    remove.addEventListener("click", () => {
      pendingTags.splice(i, 1);
      renderChips();
    });
    chip.appendChild(remove);
    tagChipsEl.appendChild(chip);
  });
}

function addTag(value: string) {
  const tag = value.trim().replace(/,$/, "").trim();
  if (tag && !pendingTags.includes(tag)) {
    pendingTags.push(tag);
    renderChips();
  }
  inputTag.value = "";
  hideSuggestions();
}

function hideSuggestions() {
  tagSuggestions.hidden = true;
  tagSuggestions.innerHTML = "";
}

function showSuggestions(matches: string[]) {
  if (matches.length === 0) { hideSuggestions(); return; }
  tagSuggestions.innerHTML = "";
  matches.forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault(); // prevent blur before click
      addTag(tag);
    });
    tagSuggestions.appendChild(li);
  });
  tagSuggestions.hidden = false;
}

inputTag.addEventListener("input", () => {
  const val = inputTag.value.trim().toLowerCase();
  if (!val) { hideSuggestions(); return; }
  const matches = allTags.filter(
    (t) => t.toLowerCase().startsWith(val) && !pendingTags.includes(t)
  );
  showSuggestions(matches);
});

inputTag.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === ",") {
    e.preventDefault();
    if (inputTag.value.trim()) addTag(inputTag.value);
  } else if (e.key === "Backspace" && !inputTag.value && pendingTags.length) {
    pendingTags.pop();
    renderChips();
  }
});

inputTag.addEventListener("blur", () => {
  setTimeout(hideSuggestions, 150);
});

// --- Sign-in form ---

formSignin.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(signinError);
  btnSignin.disabled = true;
  const resp = await send<SignInResponse>({
    type: "SIGN_IN",
    username: inputUsername.value,
    password: inputPassword.value,
  });
  btnSignin.disabled = false;
  if (resp.ok) {
    await initSaveView();
  } else {
    showError(signinError, resp.error ?? "Sign-in failed.");
  }
});

// --- Save form ---

async function initSaveView() {
  showView("save");
  pendingTags = [];
  renderChips();
  saveError.hidden = true;
  saveSuccess.hidden = true;

  const [tabs, tagsResp] = await Promise.all([
    browser.tabs.query({ active: true, currentWindow: true }),
    send<GetTagsResponse>({ type: "GET_TAGS" }),
  ]);
  allTags = tagsResp.tags ?? [];

  const tab = tabs[0];
  const url = tab?.url ?? "";
  const isInternal =
    url.startsWith("chrome://") ||
    url.startsWith("about:") ||
    url.startsWith("moz-extension://") ||
    url.startsWith("chrome-extension://");

  if (isInternal || !url) {
    noBookmarkMsg.hidden = false;
    formSave.hidden = true;
  } else {
    noBookmarkMsg.hidden = true;
    formSave.hidden = false;
    inputTitle.value = tab?.title ?? "";
    inputUrl.value = url;
  }
}

formSave.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError(saveError);
  saveSuccess.hidden = true;
  btnSave.disabled = true;
  const resp = await send<SaveBookmarkResponse>({
    type: "SAVE_BOOKMARK",
    url: inputUrl.value,
    title: inputTitle.value,
    tags: pendingTags,
  });
  btnSave.disabled = false;
  if (resp.ok) {
    saveSuccess.hidden = false;
    setTimeout(() => {
      saveSuccess.hidden = true;
      inputTitle.value = "";
      inputUrl.value = "";
      pendingTags = [];
      renderChips();
    }, 1500);
  } else if (resp.error === "session_expired") {
    showView("signin", "Your session expired. Please sign in again.");
  } else {
    showError(saveError, resp.error ?? "Failed to save bookmark.");
  }
});

btnSignout.addEventListener("click", async () => {
  await send<SignOutResponse>({ type: "SIGN_OUT" });
  showView("signin");
});

btnSettings.addEventListener("click", () => {
  void browser.runtime.openOptionsPage();
});

// --- Init ---

async function init() {
  const state = await send<GetAuthStateResponse>({ type: "GET_AUTH_STATE" });
  if (state.isAuthenticated) {
    await initSaveView();
  } else {
    showView("signin");
  }
}

void init();
