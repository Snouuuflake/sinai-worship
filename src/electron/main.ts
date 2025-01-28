import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { readMSSFile } from "./parser.js";

const windowArray: Array<DisplayWindow> = [];

class DisplayWindow {
  index: number;
  window: BrowserWindow;

  constructor(index: number) {
    this.index = index;
    this.window = new BrowserWindow({
      minWidth: 400,
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

function sendToAllDisplayWindows(channel: string, data: any) {
  windowArray.forEach((w) => {
    w.window.webContents.send(channel, data);
  });
}

ipcMain.on("set-live-element", (_event, data) => {
  console.log(data);
  sendToAllDisplayWindows(`display-${0}-text`, data.liveElement.value);
  if (data.liveElement.type === "text") {
    sendToAllDisplayWindows(
      `display-${data.index}-text`,
      data.liveElement.value,
    );
  }
  //else if (data.liveElement.type === "image") {
  //  sendToAllDisplayWindows(
  //    `display${data.index}-image`,
  //    data.liveElement.value, // (path)
  //  );
  //}
});

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
  });
  mainWindow.setMenu(null);
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "/dist-react/index.html"));
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("new-display-window", (_event, index: number) => {
  new DisplayWindow(index);
});

ipcMain.on("alert", (_event, message: string) => {
  dialog.showMessageBox({ message: message });
});

ipcMain.handle("read-song", (_event) => {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog({ properties: ["openFile"] }).then((result) => {
      if (!result.canceled) {
        readMSSFile(result.filePaths[0]).then(
          (s) => {
            resolve(s);
          },
          (e) => {
            dialog.showErrorBox("Error reading song", e.message);
            reject();
          },
        );
      }
    });
  });
});
