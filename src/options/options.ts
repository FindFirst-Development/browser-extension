import { clearAuth, getAuthState, setServerUrl } from "../shared/storage.js";

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

const form = el<HTMLFormElement>("form-server");
const input = el<HTMLInputElement>("input-server-url");
const urlError = el<HTMLParagraphElement>("url-error");
const urlSuccess = el<HTMLParagraphElement>("url-success");
const statusDot = el("status-dot");
const statusText = el("status-text");

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function checkStatus(serverUrl: string, isAuthenticated: boolean, username: string | null) {
  statusDot.className = "dot dot--checking";
  statusText.textContent = "Checking…";

  if (isAuthenticated && username) {
    statusDot.className = "dot dot--green";
    statusText.textContent = `Connected as ${username}`;
    return;
  }

  try {
    const response = await fetch(`${serverUrl}/actuator/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      statusDot.className = "dot dot--yellow";
      statusText.textContent = "Not signed in";
    } else {
      statusDot.className = "dot dot--red";
      statusText.textContent = "Cannot reach server";
    }
  } catch {
    statusDot.className = "dot dot--red";
    statusText.textContent = "Cannot reach server";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  urlError.hidden = true;
  urlSuccess.hidden = true;

  const value = input.value.trim();
  if (!isValidUrl(value)) {
    urlError.textContent = "Please enter a valid http:// or https:// URL.";
    urlError.hidden = false;
    return;
  }

  const { serverUrl: prevUrl } = await getAuthState();
  const urlChanged = value !== prevUrl;

  await setServerUrl(value);

  if (urlChanged) {
    await clearAuth();
    urlSuccess.textContent = "Saved. Please sign in again in the extension popup.";
  } else {
    urlSuccess.textContent = "Saved.";
  }
  urlSuccess.hidden = false;

  const state = await getAuthState();
  await checkStatus(value, state.isAuthenticated, state.username);
});

async function init() {
  const state = await getAuthState();
  input.value = state.serverUrl;
  await checkStatus(state.serverUrl, state.isAuthenticated, state.username);
}

void init();
