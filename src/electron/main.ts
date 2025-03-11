import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { readMSSFile, writeMSSFile } from "./parser.js";
import { promises as fsp } from "fs";

/**
 * Compares the keys and types of all first children of any two objects
 */
function compareSurfaceSchema(obj1: any, obj2: any): boolean {
  return (
    JSON.stringify(
      Object.keys(obj1)
        .sort()
        .flatMap((k) => [k, typeof (obj1 as any)[k]]),
    ) ===
    JSON.stringify(
      Object.keys(obj2)
        .sort()
        .flatMap((k) => [k, typeof (obj2 as any)[k]]),
    )
  );
}

function handleJSON(channel: string, callback: (obj: any) => any) {
  ipcMain.handle(channel, (_event, data) => {
    return JSON.stringify(callback(JSON.parse(data)));
  });
}

function handleJSONAsync(
  channel: string,
  callback: (obj: any) => Promise<any>,
) {
  ipcMain.handle(channel, async (_event, data) => {
    return JSON.stringify(await callback(JSON.parse(data)));
  });
}

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

//
//function readSettingsFile(): SettingsType {
//  const defaultSettings: SettingsType = {
//    global: [{ key: "background", type: "csscolor", default: "black" }],
//    text: [
//      { key: "Margin Left", type: "pnumber", default: 0 },
//      { key: "Margin Right", type: "pnumber", default: 0 },
//      { key: "Margin Top", type: "pnumber", default: 0 },
//      { key: "Margin Bottom", type: "pnumber", default: 0 },
//      { key: "Font Size", type: "pnumber", default: 20 },
//      { key: "Font Family", type: "string", default: "Helvetica" },
//      { key: "Color", type: "csscolor", default: "white" },
//      { key: "Bold", type: "boolean", default: false },
//    ],
//  };
//}

app.on("ready", () => {
  //loading settings **blocking**

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

  ipcMain.handle("save-song", (_event, song) => {
    return new Promise<void>((resolve, reject) => {
      dialog
        .showSaveDialog(mainWindow, {
          title: "Save Song",
          buttonLabel: "Save",
          filters: [{ name: "txt", extensions: ["txt"] }],
        })
        .then((res) => {
          if (res.canceled) {
            resolve();
          } else {
            writeMSSFile(res.filePath, song).then(
              () => {
                resolve();
              },
              (err) => {
                reject(err);
              },
            );
          }
        });
    });
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

//LATEST
handleJSONAsync("read-display-settings", async (_) => {
  const makeDefaultConfig = () =>
    ({
      globalDisplay: {
        global: [
          {
            key: "background",
            type: "csscolor",
            default: "black",
            value: null,
          },
        ],
        text: [
          { key: "Margin Left", type: "pnumber", default: 0, value: null },
          { key: "Margin Right", type: "pnumber", default: 0, value: null },
          { key: "Margin Top", type: "pnumber", default: 0, value: null },
          { key: "Margin Bottom", type: "pnumber", default: 0, value: null },
          { key: "Font Size", type: "pnumber", default: 20, value: null },
          // TODO: proper font selector
          {
            key: "Font Family",
            type: "font",
            default: "Helvetica",
            value: null,
          },
          { key: "Color", type: "csscolor", default: "white", value: null },
          { key: "Bold", type: "boolean", default: false, value: null },
        ],
      },
      specificDisplays: [],
    }) as FullDisplayConfigType;

  try {
    const fConfig = JSON.parse(
      await fsp.readFile(path.join(app.getAppPath(), "config.json"), "utf8"),
    );

    const curConfig = makeDefaultConfig();

    const updateDisplayField = (
      og: DisplayConfigEntryType[],
      updater: DisplayConfigEntryType[],
    ) => {
      console.log(updater);
      for (const entry of updater) {
        const found = og.find((x) => x.key === entry.key);
        if (found) {
          og[og.indexOf(found)] = entry;
        } else {
          og.push(entry);
        }
      }
    };

    const updateDisplay = (
      og: DisplayConfigType,
      updater: DisplayConfigType,
    ) => {
      console.log(updater);
      updateDisplayField(og.global, updater.global);
      updateDisplayField(og.text, updater.text);
    };

    updateDisplay(curConfig.globalDisplay, fConfig.globalDisplay);
    return curConfig;
  } catch (err) {
    return makeDefaultConfig();
  }
});

ipcMain.on("new-display-window", (_event, index: number) => {
  new DisplayWindow(index);
});

ipcMain.on("alert", (_event, message: string) => {
  dialog.showMessageBox({ message: message });
});

ipcMain.on("update-css", (_event, css, index) => {
  sendToAllDisplayWindows(`res-${index}-css`, css);
});

ipcMain.on("req-css", (_event, index) => {
  sendToAllDisplayWindows(`res-${index}-css`, "cite {color: pink;}");
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

//class Settings {
//  window: BrowserWindow;
//  global: ConfigEntryType[];
//  text: ConfigEntryType[];
//  constructor(mainWindow: BrowserWindow) {
//    this.window = mainWindow;
//    this.global = [{ key: "background", type: "csscolor", default: "black" }];
//    this.text = [
//      { key: "Margin Left", type: "pnumber", default: 0 },
//      { key: "Margin Right", type: "pnumber", default: 0 },
//      { key: "Margin Top", type: "pnumber", default: 0 },
//      { key: "Margin Bottom", type: "pnumber", default: 0 },
//      { key: "Font Size", type: "pnumber", default: 20 },
//      { key: "Font Family", type: "string", default: "Helvetica" },
//      { key: "Color", type: "csscolor", default: "white" },
//      { key: "Bold", type: "boolean", default: false },
//    ];
//  }
//}
