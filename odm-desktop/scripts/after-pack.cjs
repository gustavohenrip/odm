const { execFileSync } = require('node:child_process');

module.exports = async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin' || process.env.CSC_LINK) return;

  execFileSync('codesign', [
    '--force',
    '--deep',
    '--sign',
    '-',
    context.appOutDir + '/ODM.app',
  ], { stdio: 'inherit' });
};
