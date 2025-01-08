import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";

const windowArray: Array<DisplayWindow> = [];

class DisplayWindow {
  index: number;
  window: BrowserWindow;

  constructor(index: number) {
    this.index = index;
    this.window = new BrowserWindow({
      webPreferences: {
        preload: getPreloadPath(),
        additionalArguments: [`${index}`],
      },
    });

    this.window.on("close", () => {
      windowArray.splice(windowArray.indexOf(this), 1);
      console.log(windowArray);
    });

    windowArray.push(this);

    this.window.loadFile(
      path.join(app.getAppPath(), "/dist-display/index.html"),
    );
    console.log(windowArray);
  }
}

ipcMain.handle("invoke-index", (event) => {
  return new Promise((resolve, reject) => {
    const senderWindow = windowArray.find(
      (element: DisplayWindow) =>
        element.window.webContents.id == event.sender.id,
    );
    if (senderWindow) {
      resolve(senderWindow.index);
    } else {
      reject("window doesnt exist ?¡??!?");
    }
  });
});

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
  //mainWindow.loadFile(path.join(app.getAppPath(), "/dist-display/index.html"))
});

ipcMain.on("new-display-window", (_event, index: number) => {
  new DisplayWindow(index);
});
