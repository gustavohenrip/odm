const NATIVE_HOST = 'com.odm.bridge';

const DEFAULT_SETTINGS = {
  enabled: true,
  minSizeKB: 256,
  extensions: [
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'tgz',
    'iso', 'dmg', 'pkg', 'exe', 'msi', 'deb', 'rpm', 'apk', 'appimage',
    'mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', 'mpg',
    'mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma', 'opus',
    'pdf', 'epub',
  ],
  excludeHosts: ['mail.google.com', 'docs.google.com', 'drive.google.com'],
  excludeMime: ['text/html', 'application/xhtml+xml'],
  showNotifications: true,
};

async function loadSettings() {
  const stored = await chrome.storage.sync.get('odmSettings');
  return { ...DEFAULT_SETTINGS, ...(stored.odmSettings || {}) };
}

async function saveSettings(values) {
  await chrome.storage.sync.set({ odmSettings: { ...DEFAULT_SETTINGS, ...values } });
}

function extensionOf(url, filename) {
  const tryName = (s) => {
    const m = /\.([a-z0-9]{1,6})(?:[?#].*)?$/i.exec(s || '');
    return m ? m[1].toLowerCase() : '';
  };
  return tryName(filename) || tryName(url);
}

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

function shouldIntercept(item, settings) {
  if (!settings.enabled) return false;
  if (item.byExtensionId) return false;
  if (item.state !== 'in_progress' && item.state !== 'interrupted') return false;
  if (item.finalUrl && /^blob:|^data:/i.test(item.finalUrl)) return false;
  if (item.finalUrl && /^https?:/i.test(item.finalUrl) === false) return false;
  const host = hostOf(item.finalUrl || item.url);
  if (settings.excludeHosts.some((h) => host.endsWith(h))) return false;
  if (item.mime && settings.excludeMime.includes(item.mime.toLowerCase())) return false;
  const ext = extensionOf(item.finalUrl || item.url, item.filename);
  const sizeKB = Math.max(0, (item.totalBytes || 0) / 1024);
  if (sizeKB > 0 && sizeKB < settings.minSizeKB && !settings.extensions.includes(ext)) {
    return false;
  }
  if (settings.extensions.length > 0 && ext && settings.extensions.includes(ext)) return true;
  if (sizeKB >= settings.minSizeKB) return true;
  return ext && settings.extensions.includes(ext);
}

function nativeRequest(payload) {
  return new Promise((resolve, reject) => {
    let port;
    try {
      port = chrome.runtime.connectNative(NATIVE_HOST);
    } catch (e) {
      reject(e);
      return;
    }
    const cleanup = () => {
      try { port.disconnect(); } catch {}
    };
    port.onMessage.addListener((response) => {
      cleanup();
      resolve(response);
    });
    port.onDisconnect.addListener(() => {
      const err = chrome.runtime.lastError;
      if (err) reject(new Error(err.message));
    });
    try {
      port.postMessage(payload);
    } catch (e) {
      cleanup();
      reject(e);
    }
  });
}

async function getCookieHeader(url) {
  try {
    const cookies = await chrome.cookies.getAll({ url });
    return cookies.map((c) => `${c.name}=${c.value}`).join('; ');
  } catch {
    return '';
  }
}

async function notify(title, message) {
  const settings = await loadSettings();
  if (!settings.showNotifications) return;
  try {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon.png'),
      title,
      message,
      priority: 0,
    });
  } catch {}
}

async function sendToOdm(url, options = {}) {
  const referer = options.referer || '';
  const cookieHeader = options.cookieHeader || (await getCookieHeader(url));
  const payload = {
    action: 'enqueue',
    payload: {
      url,
      folder: undefined,
    },
    meta: {
      referer,
      cookies: cookieHeader,
      userAgent: navigator.userAgent,
    },
  };
  return nativeRequest(payload);
}

chrome.downloads.onCreated.addListener(async (item) => {
  try {
    const settings = await loadSettings();
    if (!shouldIntercept(item, settings)) return;
    const url = item.finalUrl || item.url;
    if (!url) return;
    let referer = '';
    try {
      const tab = item.referrer ? null : await chrome.tabs.query({ active: true, currentWindow: true });
      referer = item.referrer || (tab && tab[0] && tab[0].url) || '';
    } catch {}
    const cookieHeader = await getCookieHeader(url);
    const result = await sendToOdm(url, { referer, cookieHeader });
    if (result && result.ok !== false) {
      try { await chrome.downloads.cancel(item.id); } catch {}
      try { await chrome.downloads.erase({ id: item.id }); } catch {}
      await notify('Sent to ODM', url);
    } else {
      const reason = (result && result.error) || 'unknown error';
      await notify('ODM bridge unreachable', reason);
    }
  } catch (e) {
    await notify('ODM bridge error', String(e && e.message || e));
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    chrome.contextMenus.create({
      id: 'odm-send-link',
      title: 'Send link to ODM',
      contexts: ['link'],
    });
    chrome.contextMenus.create({
      id: 'odm-send-page',
      title: 'Send page URL to ODM',
      contexts: ['page'],
    });
  } catch {}
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const url = info.menuItemId === 'odm-send-link' ? info.linkUrl : (tab && tab.url);
  if (!url) return;
  try {
    const cookieHeader = await getCookieHeader(url);
    const referer = (tab && tab.url) || '';
    const result = await sendToOdm(url, { referer, cookieHeader });
    if (result && result.ok !== false) {
      await notify('Sent to ODM', url);
    } else {
      await notify('ODM error', (result && result.error) || 'unknown');
    }
  } catch (e) {
    await notify('ODM bridge error', String(e && e.message || e));
  }
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg && msg.type === 'odm/handshake') {
    nativeRequest({ action: 'handshake' })
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: String(e && e.message || e) }));
    return true;
  }
  if (msg && msg.type === 'odm/send') {
    sendToOdm(msg.url, { referer: msg.referer })
      .then((r) => sendResponse(r))
      .catch((e) => sendResponse({ ok: false, error: String(e && e.message || e) }));
    return true;
  }
  return false;
});
