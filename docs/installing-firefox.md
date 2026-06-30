# Installing the FindFirst Extension on Firefox

Firefox requires a signed extension for permanent installation, but for development and personal use you can load it temporarily or use Firefox Developer Edition / Nightly, which accept unsigned extensions.

## 1. Build the extension

From the repo root:

```sh
make build-firefox
```

The built extension will be at `dist/firefox/`.

---

## Option A — Temporary installation (any Firefox, resets on restart)

1. Navigate to `about:debugging` in your address bar.
2. Click **This Firefox** in the left sidebar.
3. Click **Load Temporary Add-on…**
4. Open `dist/firefox/` and select **manifest.json**.

The extension stays loaded until Firefox restarts. Re-load it after each restart by repeating steps 3–4, or after each build by clicking **Reload** on the FindFirst entry.

---

## Option B — Persistent installation (Firefox Developer Edition or Nightly)

Firefox Developer Edition and Firefox Nightly allow unsigned extensions to be installed persistently.

1. Download [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/) or [Firefox Nightly](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly).
2. Navigate to `about:config` and set `xpinstall.signatures.required` to `false`.
3. Package the extension:
   ```sh
   make package-firefox
   ```
4. Navigate to `about:addons`, click the gear icon, and choose **Install Add-on From File…**
5. Select the `.zip` from the `web-ext-artifacts/` directory.

---

## Option C — web-ext (recommended for active development)

`web-ext` is included as a dev dependency and launches Firefox with the extension pre-loaded and live-reloading.

```sh
# In one terminal — rebuild on every file change
make dev-firefox

# In another terminal — launch Firefox with the extension
make run-firefox
```

Firefox will open automatically. The extension reloads whenever `dist/firefox/` changes.

To lint the extension before packaging:

```sh
make lint-firefox
```

To produce a distributable `.zip` (output goes to `web-ext-artifacts/`):

```sh
make package-firefox
```

---

## Configure the extension

Click the FindFirst icon in the toolbar and open **Options** to set your FindFirst server URL and credentials.

## Removing the extension

- **Temporary install:** navigate to `about:debugging → This Firefox` and click **Remove** next to FindFirst.
- **Persistent install:** navigate to `about:addons` and click **Remove** next to FindFirst.
