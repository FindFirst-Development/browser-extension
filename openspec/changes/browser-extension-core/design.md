## Context

FindFirst is a Spring Boot bookmarking platform with JWT-based auth (HttpOnly cookies) and a REST API. The browser extension repo currently has a Manifest V2 Firefox stub (no real functionality) and an empty Chrome directory. We are building real extensions from scratch with a shared source tree that targets both browsers.

## Goals / Non-Goals

**Goals:**
- One `src/` tree builds both Chrome (Manifest V3) and Firefox (Manifest V3) artifacts
- Users can sign in, save pages with tags, and configure their server URL from within the extension
- Works against any self-hosted FindFirst instance (configurable base URL)
- Minimal bundle — no heavy UI framework, no unnecessary runtime dependencies

**Non-Goals:**
- Syncing bookmarks back to the browser's native bookmark manager
- Offline read-later / full-page caching
- Supporting Manifest V2 (dropped in Chrome; aligning Firefox to V3)
- Multi-account (single server URL / single user session per extension install)
- Publishing to extension stores (out of scope for this change)

## Decisions

### 1. Shared source tree, browser-specific manifests

**Decision**: Single `src/` directory. Two manifest templates (`manifests/manifest.chrome.json`, `manifests/manifest.firefox.json`). Build script (`build.js`) outputs `dist/chrome/` and `dist/firefox/`.

**Rationale**: All logic is identical across browsers; only the manifest and a few API shim differences need to be browser-specific. Duplicating source would immediately diverge.

**Alternative considered**: Separate `chrome-extension/` and `firefox-extension/` directories with symlinks — rejected because symlinks are fragile in git on Windows, and there is no meaningful browser-specific logic in the source.

### 2. TypeScript — no UI framework

**Decision**: TypeScript for all source files (`src/**/*.ts`). Plain HTML/CSS for popup and options pages. No React, Vue, or Svelte.

**Rationale**: Extension popups are tiny (< 400px wide). The DOM surface is trivial (a handful of form controls). A framework adds > 30 KB to the bundle and complicates the build without any benefit at this scale. TypeScript is used to match the FindFirst frontend and to catch type errors across the shared API client and message-passing interface at compile time.

**Alternative considered**: Preact (3 KB) — kept as an option if complexity grows, but deferred for now.

### 3. esbuild for bundling

**Decision**: esbuild via a Node.js build script (`build.js`). Bundles TypeScript, copies HTML/CSS/icons, injects the right manifest.

**Rationale**: Zero-config, extremely fast, no Webpack boilerplate. esbuild has native TypeScript transpilation support — no separate transpile step needed. `tsc --noEmit` is run separately for type-checking only.

**Alternative considered**: Rollup — more plugin ecosystem but more configuration overhead; unnecessary here.

### 4. Auth via HttpOnly cookies (no token storage in extension)

**Decision**: The background service worker calls `POST /user/signin` with `Authorization: Basic base64(user:pass)`. The server sets an HttpOnly JWT cookie on the FindFirst origin. All subsequent `fetch()` calls from the background include `credentials: "include"`, so the browser cookie jar handles auth automatically. The extension stores only `{ serverUrl, username, isAuthenticated }` in `browser.storage.local` — never the password or JWT string.

**Rationale**: Matches the server's existing auth model exactly. Storing a JWT in `storage.local` would expose it to any extension JS; leaving it in the cookie jar keeps it HttpOnly and leverages the server's existing token refresh/expiry logic.

**Alternative considered**: Storing the JWT in `storage.local` and sending it as `Authorization: Bearer` — works, but requires the server to also accept Bearer tokens (it currently supports both cookie and header). Rejected because it unnecessarily duplicates the token outside the browser's secure cookie jar.

**Caveat**: `credentials: "include"` in a service worker fetch works only when the extension has `host_permissions` for the FindFirst server URL. This must be set at install time for the default URL, with dynamic permission requests if the user changes the server URL.

### 5. All API calls routed through the background service worker

**Decision**: Popup and options pages send messages to the background service worker (`browser.runtime.sendMessage`); the background makes all `fetch()` calls to the FindFirst API and replies with results.

**Rationale**: Centralises auth state management. Prevents CORS complexity in popup context. Service workers persist the cookie jar state correctly; popup contexts are ephemeral.

**Alternative considered**: Popup making direct fetch calls — simpler code path but creates duplicate auth-checking logic and complicates cookie handling in extension page contexts.

### 6. Manifest V3 for both browsers

**Decision**: Target Manifest V3 on both Chrome and Firefox.

**Rationale**: Chrome has removed V2 support. Firefox supports V3 and recommends it for new extensions. The main V2→V3 change is `background.scripts` → `background.service_worker`; Firefox additionally supports `background.scripts` in V3 for compatibility, but we'll use `service_worker` for alignment.

**Browser differences handled in build**: Firefox manifest includes `browser_specific_settings.gecko` with extension ID and minimum Firefox version (109+, which added MV3 GA support). Chrome manifest omits this.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Service worker terminates between API calls, losing in-flight context | Keep all state in `browser.storage.local`; re-read on each message. Service workers wake on `browser.runtime.onMessage`. |
| `credentials: "include"` rejected by server CORS policy | FindFirst must return `Access-Control-Allow-Origin: <extension-origin>` and `Access-Control-Allow-Credentials: true`. This may require a server-side change — document as a deployment requirement. |
| User changes server URL mid-session | Clear auth state and prompt re-login on URL change in options page. |
| Firefox MV3 service worker support is newer | Require Firefox 109+. Document minimum browser versions. |
| esbuild doesn't type-check (transpiles only) | Run `tsc --noEmit` as a separate CI step using the project `tsconfig.json`; esbuild handles bundling, tsc handles type validation. |

## Migration Plan

1. Build produces `dist/chrome/` and `dist/firefox/` — these replace the old `chrome-extension/` and `firefox-extension/` stub directories
2. Old `firefox-extension/manifest.json` (V2) is deleted; its icons are moved to `src/icons/`
3. No user-facing migration (extension is not yet published; no existing users)

## Open Questions

- Does the FindFirst server need a CORS configuration change to allow requests from extension origins (`moz-extension://` / `chrome-extension://`)? → Needs server-side verification before this extension can be tested end-to-end.
- Should the context menu option appear on all pages or only on pages the user is actively viewing? → Current plan: all pages (saves the right-clicked link's href, or the tab URL if no link selected).
