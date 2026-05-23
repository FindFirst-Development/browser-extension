## Why

FindFirst has a web app and API for saving and searching bookmarks, but users must navigate to the app to save a page — breaking their browsing flow. Browser extensions give users a one-click way to save any page to FindFirst without leaving the tab.

## What Changes

- Introduce a shared-source extension codebase (single `src/` tree) that builds separate Chrome and Firefox artifacts
- Replace the existing Firefox Manifest V2 stub with a real Manifest V3 extension
- Implement the Chrome extension from scratch with Manifest V3
- Add a popup UI for quick-saving the current page with tags
- Add a context menu entry to save the current page or a selected link
- Add an options/settings page for configuring the FindFirst server URL
- Add authentication flow (sign-in form → JWT stored in extension storage)

## Capabilities

### New Capabilities

- `auth`: Sign in to a FindFirst instance from the extension; store JWT and server URL in extension storage; sign out; detect expired sessions
- `bookmark-save`: Save the current page (or a right-clicked link) to FindFirst with a title and optional tags; pre-fills title/URL from the active tab
- `tag-management`: Fetch the user's existing tags for autocomplete; create new tags inline during bookmark save
- `settings`: Options page to configure the FindFirst server base URL and view connection status
- `build-system`: Shared `src/` with an esbuild-based build that emits separate `dist/chrome/` and `dist/firefox/` artifacts; Vitest unit test setup

### Modified Capabilities

*(none — this is a greenfield build)*

## Impact

- **New files**: `src/` tree (background, popup, options, shared API client), `manifest.chrome.json`, `manifest.firefox.json`, `package.json`, `build.js`
- **Replaced**: `firefox-extension/` stub replaced by proper build output in `dist/firefox/`
- **New runtime dependencies**: none (TypeScript compiled to plain JS, no runtime framework)
- **New dev dependencies**: esbuild, vitest, web-ext, typescript, @types/chrome, @types/firefox-webext-browser
- **API surface**: consumes FindFirst REST API — `/user/signin`, `/api/bookmark`, `/api/tags`, `/api/tag`, `/api/search/text`
- **Permissions required**: `activeTab`, `storage`, `contextMenus`, `host_permissions` for the configured FindFirst host
