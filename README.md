# FindFirst Browser Extensions

Browser extensions for Chrome and Firefox that let you save pages and links to [FindFirst](https://findfirst.dev).

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm (comes with Node.js)

## Building

Install dependencies once:

```sh
npm install
```

| Target | Command |
|---|---|
| Build both extensions | `make` or `make build` |
| Build Chrome only | `make build-chrome` |
| Build Firefox only | `make build-firefox` |
| Type-check | `make typecheck` |
| Run tests | `make test` |
| Watch mode — Chrome | `make dev-chrome` |
| Watch mode — Firefox | `make dev-firefox` |
| Run in Firefox (web-ext) | `make run-firefox` |
| Lint Firefox extension | `make lint-firefox` |
| Package Firefox extension | `make package-firefox` |
| Remove build artifacts | `make clean` |

Built extensions land in `dist/chrome/` and `dist/firefox/`.

## Installing

- [Installing on Chrome](docs/installing-chrome.md)
- [Installing on Firefox](docs/installing-firefox.md)

## Project layout

```
src/
  background/   service worker (shared logic)
  popup/        toolbar popup UI
  options/      extension options page
  icons/        extension icons
manifests/      per-browser manifest.json files
dist/           build output (git-ignored)
```
