# ODM Integration (Chrome / Edge / Brave / Chromium / Firefox)

Captures downloads from the browser and routes them to the local ODM
desktop app, the same way IDM Integration Module does. Works for direct
links and for downloads triggered through a click or redirect.

## How it works

1. The ODM desktop app writes a handshake file at `~/.odm/handshake.json`
   with the local backend port and session token, and registers a Native
   Messaging host (`com.odm.bridge`) for Chrome, Chromium, Edge, Brave
   and Firefox.
2. The browser extension intercepts `chrome.downloads.onCreated`, decides
   if the file should go to ODM (size, extension, host filters) and asks
   the native host to forward the URL plus referer and cookies to the
   backend over HTTP.
3. ODM creates the download with multi-segment, mirrors and the rate
   limiter that the desktop app has configured.

## Install

### 1. Run ODM desktop at least once

The desktop app installs the native messaging manifest in the right
folders for every browser it detects (`~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.odm.bridge.json`
on macOS, `~/.config/google-chrome/NativeMessagingHosts/com.odm.bridge.json`
on Linux, etc.). It also writes the handshake file the host reads on
each request.

Open ODM, then close it once before installing the extension.

### 2. Load the extension unpacked

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
2. Enable **Developer mode**.
3. Click **Load unpacked** and pick this `chrome-extension/` folder.
4. Note the **Extension ID** Chrome assigns. The default install allows
   any extension ID; if you want to lock it down edit
   `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.odm.bridge.json`
   and change `allowed_origins` to `chrome-extension://YOUR_ID/`.

### 3. Verify the bridge

Click the extension toolbar icon. The popup should show **Connected**
along with the local backend URL. If it says **ODM not running**, start
the desktop app. If it says **Bridge unreachable**, restart the browser
once so the new native messaging manifest is picked up.

## Usage

- Direct link clicks and redirects that Chrome would normally save to
  Downloads are sent to ODM instead. The native Chrome download is
  cancelled and removed from the shelf.
- Right-click a link or a page → **Send link to ODM** / **Send page URL
  to ODM** to enqueue manually.
- Use the popup toggle to disable interception temporarily.
- Open **Settings** to tune the minimum size, the allowed extension
  list, excluded hosts and excluded MIME types.

## Filters (defaults)

- Minimum size: **256 KB**
- Always intercept: archives (zip/rar/7z/...), iso/dmg/pkg, exe/msi/deb/rpm,
  video/audio, pdf and epub.
- Skipped hosts: `mail.google.com`, `docs.google.com`, `drive.google.com`.
- Skipped MIME: `text/html`, `application/xhtml+xml`.

Edit any of these in the options page.

## Troubleshooting

- **Popup says “Bridge unreachable”** — restart the browser. The native
  messaging manifest is loaded once at startup. Make sure the file
  `~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.odm.bridge.json`
  exists and points to a script that is executable (`chmod +x`).
- **Popup says “ODM not running”** — open the ODM desktop app. The
  handshake file lives at `~/.odm/handshake.json` and is rewritten on
  every backend start.
- **Downloads still happen in Chrome** — open the extension popup and
  confirm the toggle is on. Files smaller than the minimum size and not
  on the allow list stay in Chrome.
- **Locked-down corporate Chrome** — `nativeMessaging` requires the
  policy to allow it. Check `chrome://policy` for any
  `NativeMessagingBlocklist` entries.

## Pack for the Web Store later

`chrome-extension/` is laid out so you can zip it directly:

```
cd chrome-extension && zip -r ../odm-integration.zip . -x "*.DS_Store"
```

Submit the zip to the Chrome Web Store dashboard. Replace `icon.png`
with proper 16/32/48/128 PNGs before publishing.
