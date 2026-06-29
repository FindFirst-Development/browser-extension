# Installing the FindFirst Extension on Chrome

## 1. Build the extension

From the repo root:

```sh
make build-chrome
```

The built extension will be at `dist/chrome/`.

## 2. Open Chrome's extension manager

Navigate to `chrome://extensions` in your address bar.

## 3. Enable Developer mode

Toggle **Developer mode** on — it's in the top-right corner of the Extensions page.

## 4. Load the unpacked extension

Click **Load unpacked** and select the `dist/chrome/` directory from this repo.

The FindFirst icon will appear in your Chrome toolbar. If you don't see it, click the puzzle-piece icon and pin FindFirst.

## 5. Configure the extension

Click the FindFirst icon and then **Options** (or navigate to the extension's options page) to set your FindFirst server URL and credentials.

## Updating after a code change

Re-run `make build-chrome`, then click the **Reload** (↻) button on the FindFirst card at `chrome://extensions`. No need to re-add the extension.

## Removing the extension

On `chrome://extensions`, click **Remove** on the FindFirst card.
