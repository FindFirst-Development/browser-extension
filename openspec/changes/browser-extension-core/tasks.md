## 1. Project Scaffold & Build System

- [x] 1.1 Initialize `package.json` with dev dependencies: esbuild, vitest, web-ext, typescript, @types/chrome, @types/firefox-webext-browser
- [x] 1.2 Create `src/` directory tree: `background/`, `popup/`, `options/`, `shared/`, `icons/`
- [x] 1.3 Move existing icon assets from `firefox-extension/icons/` to `src/icons/`
- [x] 1.4 Write `manifests/manifest.chrome.json` (MV3, service_worker, host_permissions)
- [x] 1.5 Write `manifests/manifest.firefox.json` (MV3, service_worker, browser_specific_settings.gecko)
- [x] 1.6 Write `tsconfig.json` with `strict: true`, `target: "ES2022"`, `lib: ["ES2022", "DOM"]`, `moduleResolution: "bundler"`, and `types: ["chrome", "firefox-webext-browser"]`; set `noEmit: true` since esbuild handles output
- [x] 1.7 Write `build.js` esbuild script that transpiles TypeScript entry points and copies assets to `dist/chrome/` and `dist/firefox/`
- [x] 1.8 Add `package.json` scripts: `build`, `build:chrome`, `build:firefox`, `dev:chrome`, `dev:firefox`, `test`, `typecheck` (runs `tsc --noEmit`)
- [x] 1.9 Add `.gitignore` entries for `dist/`, `node_modules/`
- [x] 1.10 Delete the old `firefox-extension/` stub files (manifest.json, ffextension.js, README)
- [x] 1.11 Verify `npm run build` and `npm run typecheck` both pass; confirm valid `dist/chrome/` and `dist/firefox/` directories

## 2. Shared API Client

- [x] 2.1 Implement `src/shared/api.ts` — `getServerUrl()` reads `serverUrl` from storage with localhost fallback
- [x] 2.2 Implement `signin(username, password)` — calls `POST /user/signin` with Basic Auth header and `credentials: "include"`
- [x] 2.3 Implement `saveBookmark(url, title, tags)` — calls `POST /api/bookmark`; returns bookmark or throws on 401/error
- [x] 2.4 Implement `getTags()` — calls `GET /api/tags`; returns tag array or empty array on error
- [x] 2.5 Add 401-interception wrapper: any response with status 401 clears auth state and throws `SessionExpiredError`
- [x] 2.6 Implement `src/shared/storage.ts` — typed helpers for reading/writing `{ serverUrl, isAuthenticated, username }` from `browser.storage.local`
- [x] 2.7 Define shared message types in `src/shared/messages.ts` — discriminated union covering all `browser.runtime.sendMessage` payloads and response shapes

## 3. Background Service Worker

- [x] 3.1 Create `src/background/service-worker.ts` with `browser.runtime.onMessage` listener
- [x] 3.2 Handle message `{ type: "SIGN_IN", username, password }` — call `api.signin()`, update storage, return result
- [x] 3.3 Handle message `{ type: "SIGN_OUT" }` — clear auth fields from storage, return ok
- [x] 3.4 Handle message `{ type: "SAVE_BOOKMARK", url, title, tags }` — call `api.saveBookmark()`, return result or error
- [x] 3.5 Handle message `{ type: "GET_TAGS" }` — call `api.getTags()`, return tag array
- [x] 3.6 Handle message `{ type: "GET_AUTH_STATE" }` — return `{ isAuthenticated, username }` from storage
- [x] 3.7 Register context menu item on service worker install: "Save to FindFirst" on `link` and `page` contexts
- [x] 3.8 Handle `browser.contextMenus.onClicked` — save bookmark (link href or tab URL), show notification on success/error
- [x] 3.9 Handle `browser.contextMenus.onClicked` when not authenticated — show notification to open extension and sign in

## 4. Popup UI

- [x] 4.1 Create `src/popup/popup.html` with sign-in form and bookmark-save form (hidden by auth state)
- [x] 4.2 Create `src/popup/popup.css` — minimal, accessible styles; max-width 380px
- [x] 4.3 Create `src/popup/popup.ts` — on load, send `GET_AUTH_STATE` to background and render correct view
- [x] 4.4 Implement sign-in view: username/password fields, submit calls `SIGN_IN`, shows inline error on failure
- [x] 4.5 Implement bookmark-save view: pre-fill title/URL from `browser.tabs.query({active: true, currentWindow: true})`
- [x] 4.6 Disable pre-fill for `chrome://`, `about:`, and `moz-extension://` URLs; show "Cannot bookmark this page" message
- [x] 4.7 Implement tag chip input: Enter/comma adds a chip, backspace removes last chip, chips render with × button
- [x] 4.8 Wire tag autocomplete: on keystroke, filter tags received from `GET_TAGS`, show dropdown, select on click/Enter
- [x] 4.9 Wire save button: disable during in-flight request, send `SAVE_BOOKMARK`, show success or error message
- [x] 4.10 After successful save, show confirmation for 1.5 s then reset form
- [x] 4.11 On `session_expired` error response, transition to sign-in view with expiry notice
- [x] 4.12 Add settings gear icon that calls `browser.runtime.openOptionsPage()`

## 5. Options Page

- [x] 5.1 Create `src/options/options.html` with server URL input, save button, and status indicator area
- [x] 5.2 Create `src/options/options.css` — consistent with popup styles
- [x] 5.3 Create `src/options/options.ts` — on load, populate URL input from storage
- [x] 5.4 Validate URL format (must be valid `http://` or `https://` URL) before saving; show inline error if invalid
- [x] 5.5 On save, write `serverUrl` to storage; if URL changed, clear `isAuthenticated` and show re-auth notice
- [x] 5.6 Fetch and display connection status: green (authenticated), yellow (reachable, not signed in), red (unreachable)
- [x] 5.7 Register options page in both manifests (`options_ui` / `options_page`)

## 6. Testing

- [x] 6.1 Configure Vitest with jsdom environment, TypeScript support, and a `browser` global shim for `browser.storage`, `browser.runtime`
- [x] 6.2 Write unit tests for `src/shared/api.ts` — mock fetch; test signin success, signin 401, saveBookmark, getTags, 401 interception
- [x] 6.3 Write unit tests for `src/shared/storage.ts` — test read/write/clear helpers
- [x] 6.4 Write unit tests for tag chip logic (add on Enter/comma, remove on ×, backspace)
- [x] 6.5 Write unit tests for URL validation in options page
- [x] 6.6 Verify `npm test` passes with no failures

## 7. End-to-End Verification

- [ ] 7.1 Load `dist/chrome/` as an unpacked extension in Chrome; verify popup opens and sign-in works against a running FindFirst instance
- [ ] 7.2 Save a bookmark from the popup and confirm it appears in FindFirst
- [ ] 7.3 Use context menu to save a link and confirm notification + bookmark created
- [ ] 7.4 Load `dist/firefox/` with `web-ext run`; repeat steps 7.1–7.3 in Firefox
- [ ] 7.5 Verify options page saves server URL, clears auth on URL change, and shows correct status indicator
- [ ] 7.6 Verify session-expiry flow: invalidate the JWT cookie manually, attempt a save, confirm sign-in form appears
