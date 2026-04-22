const { Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');

let tray = null;

function build(win, quitFn) {
  const iconPath = path.join(__dirname, '..', 'build', 'tray-icon.png');
  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    image = nativeImage.createEmpty();
  }
  tray = new Tray(image);
  tray.setToolTip('Azrael Download Manager');
  const menu = Menu.buildFromTemplate([
    { label: 'Open', click: () => { win?.show(); win?.focus(); } },
    { type: 'separator' },
    { label: 'Pause all', click: () => win?.webContents.send('adm:pauseAll') },
    { label: 'Resume all', click: () => win?.webContents.send('adm:resumeAll') },
    { type: 'separator' },
    { label: 'Quit', click: () => quitFn() },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => { win?.show(); win?.focus(); });
  return tray;
}

function destroy() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = { build, destroy };
