const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

function init(win) {
  if (!fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'))) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', () => {
    win?.webContents.send('odm:updateAvailable');
  });
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox(win, {
      type: 'info',
      buttons: ['Restart now', 'Later'],
      defaultId: 0,
      cancelId: 1,
      title: 'Update ready',
      message: `Version ${info?.version ?? ''} is ready.`,
      detail: 'Restart to apply the update.',
    }).then((r) => {
      if (r.response === 0) autoUpdater.quitAndInstall();
    });
  });
  autoUpdater.on('error', () => { });

  autoUpdater.checkForUpdatesAndNotify().catch(() => { });
}

module.exports = { init };
