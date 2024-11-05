const { app, BrowserWindow, Tray, Menu, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const { desktopCapturer } = require('electron');

const SCREENSHOT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const SCREENSHOT_DIR = path.join(app.getPath('desktop'), 'code/electron-1/documents/screenshots');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile('index.html');
  return win;
}

function takeScreenshot() {
  try {
    desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: screen.getPrimaryDisplay().workAreaSize.width || 1920,
          height: screen.getPrimaryDisplay().workAreaSize.height || 1200
        },
        fetchWindowIcons: true
    }).then(async (sources) => {
      const image = await sources[0].thumbnail.toPNG();

      const filePath = path.join(SCREENSHOT_DIR, `screenshot_${Date.now()}.png`);
      fs.writeFileSync(filePath, image);
      console.log(`Screenshot saved to ${filePath}`);
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
}

function takeScreenshot_2() {
    try {
      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      const win = new BrowserWindow({
        width,
        height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
      });
  
      win.webContents.capturePage().then((image) => {
        const filePath = path.join(SCREENSHOT_DIR, `screenshot_${Date.now()}.png`);
        fs.writeFileSync(filePath, image.toPNG());
        console.log(`Screenshot saved to ${filePath}`);
        win.close();
      });
    } catch (error) {
      console.error('Error taking screenshot:', error);
    }
  }

function takeScreenshot_prev() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  win.webContents.capturePage().then((image) => {
    const filePath = path.join(SCREENSHOT_DIR, `screenshot_${Date.now()}.png`);
    fs.writeFileSync(filePath, image.toPNG());
    console.log(`Screenshot saved to ${filePath}`);
    win.close();
  });
}

function createTray() {
  const tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Take Screenshot', click: takeScreenshot },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setToolTip('Screenshot App');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
  setInterval(takeScreenshot, SCREENSHOT_INTERVAL);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});