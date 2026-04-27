const dot = document.getElementById('dot');
const state = document.getElementById('state');
const detail = document.getElementById('detail');
const enabled = document.getElementById('enabled');
const sendBtn = document.getElementById('send-current');
const openOpts = document.getElementById('open-options');

async function loadSettings() {
  const stored = await chrome.storage.sync.get('odmSettings');
  return stored.odmSettings || { enabled: true };
}

async function saveSettings(values) {
  const current = await loadSettings();
  await chrome.storage.sync.set({ odmSettings: { ...current, ...values } });
}

async function refresh() {
  const settings = await loadSettings();
  enabled.checked = !!settings.enabled;
  state.textContent = 'Checking ODM…';
  detail.textContent = '';
  dot.className = 'dot';
  chrome.runtime.sendMessage({ type: 'odm/handshake' }, (response) => {
    if (chrome.runtime.lastError) {
      dot.className = 'dot err';
      state.textContent = 'Bridge unreachable';
      detail.textContent = chrome.runtime.lastError.message;
      return;
    }
    if (!response || response.ok === false) {
      dot.className = 'dot err';
      state.textContent = 'ODM not running';
      detail.textContent = (response && response.error) || 'Start the ODM desktop app';
      return;
    }
    dot.className = 'dot ok';
    state.textContent = 'Connected';
    detail.textContent = response.baseUrl || '';
  });
}

enabled.addEventListener('change', () => saveSettings({ enabled: enabled.checked }));

sendBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;
  sendBtn.disabled = true;
  sendBtn.textContent = 'Sending…';
  chrome.runtime.sendMessage({ type: 'odm/send', url: tab.url, referer: tab.url }, (response) => {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Send current tab to ODM';
    if (response && response.ok !== false) {
      state.textContent = 'Sent';
      detail.textContent = tab.url;
    } else {
      state.textContent = 'Send failed';
      detail.textContent = (response && response.error) || 'unknown error';
      dot.className = 'dot err';
    }
  });
});

openOpts.addEventListener('click', () => chrome.runtime.openOptionsPage());

refresh();
