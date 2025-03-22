import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import { isDev } from "./util.js";
import { getPreloadPath } from "./pathResolver.js";
import { readMSSFile, writeMSSFile } from "./parser.js";
import { promises as fsp } from "fs";
import * as fs from "fs";

// TODO: make this one variable for electron and react
const MAX_LIVE_ELEMENTS = 4;
let activeConfig: FullDisplayConfigType | null = null;

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

const updateDisplay = (og: DisplayConfigType, updater: DisplayConfigType) => {
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
  console.log(updater);
  updateDisplayField(og.global, updater.global);
  updateDisplayField(og.text, updater.text);
};

const readFullConfig = () => {
  const makeDefaultFullConfig = (): FullDisplayConfigType => {
    const makeDefaultConfig = (): DisplayConfigType => ({
      global: [
        {
          key: "Background",
          css: "background-color",
          type: "csscolor",
          default: "black",
          value: null,
        },
      ],
      text: [
        {
          key: "Margin Left",
          css: "margin-left",
          type: "number",
          unit: "vw",
          default: 0,
          value: null,
        },

        {
          key: "Margin Right",
          css: "margin-right",
          type: "number",
          unit: "vw",
          default: 0,
          value: null,
        },

        {
          key: "Margin Top",
          css: "margin-top",
          type: "number",
          unit: "vh",
          default: 0,
          value: null,
        },

        {
          key: "Margin Bottom",
          css: "margin-bottom",
          type: "number",
          unit: "vh",
          default: 0,
          value: null,
        },

        {
          key: "Font Size",
          css: "font-size",
          type: "number",
          unit: "px",
          default: 20,
          value: null,
        },

        // TODO: proper font selector
        {
          key: "Font Family",
          css: "font-family",
          type: "font",
          default: "Helvetica",
          value: null,
        },

        {
          key: "Color",
          css: "color",
          type: "csscolor",
          default: "White",
          value: null,
        },

        {
          key: "Bold",
          special: true,
          css: "",
          type: "boolean",
          default: false,
          value: null,
        },
      ],
    });

    return {
      globalDisplay: makeDefaultConfig(),
      specificDisplays: new Array(MAX_LIVE_ELEMENTS)
        .fill(0)
        .map((_) => makeDefaultConfig()),
    } as FullDisplayConfigType;
  };

  try {
    const fConfig: FullDisplayConfigType = JSON.parse(
      fs.readFileSync(path.join(app.getAppPath(), "config.json"), "utf8"),
    );

    const curConfig = makeDefaultFullConfig();

    updateDisplay(curConfig.globalDisplay, fConfig.globalDisplay);
    for (let i = 0; i < MAX_LIVE_ELEMENTS; i++) {
      updateDisplay(curConfig.specificDisplays[i], fConfig.specificDisplays[i]);
    }

    return curConfig;
  } catch (err) {
    fs.writeFileSync(
      path.join(app.getAppPath(), "config.json"),
      JSON.stringify(makeDefaultFullConfig()),
    );
    return makeDefaultFullConfig();
  }
};

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

  // INFO: display css managment horror
  activeConfig = readFullConfig();

  const getSpecificDisplayCss = (index: number) => {
    // copy activeConfig
    const resConfig = JSON.parse(
      JSON.stringify(activeConfig!.globalDisplay),
    ) as DisplayConfigType;
    // for all keys (global, text)
    (Object.keys(resConfig) as (keyof DisplayConfigType)[]).forEach((key) => {
      resConfig[key].forEach((entry) => {
        entry.default = entry.value !== null ? entry.value : entry.default;
        const activeSpecificFoundEntry = activeConfig!.specificDisplays[index][
          key
        ].find((x) => x.key === entry.key)!;
        entry.value = activeSpecificFoundEntry.value;
      });
    });

    (Object.keys(resConfig) as (keyof DisplayConfigType)[]).forEach((key) => {
      resConfig[key].forEach((entry) => {
        if (entry.key === "Background") {
          console.log(entry.value, entry.default);
        }
      });
    });

    const getEntryCss = (entry: DisplayConfigEntryType) => {
      if (entry.special) {
        switch (entry.key) {
          case "Bold":
            const value = entry.value !== null ? entry.value : entry.default;
            if (value) {
              return "font-weight: bold;";
            } else {
              return "";
            }
            break;

          default:
            return "";
            break;
        }
        return "";
      } else {
        const suffix = entry.unit ? entry.unit : "";
        const value = entry.value !== null ? entry.value : entry.default;
        return `${entry.css}: ${value}${suffix};`;
      }
    };

    const newCss = (Object.keys(resConfig) as (keyof DisplayConfigType)[])
      .map((key) => {
        return `.d-${index}-${key} {
        ${resConfig[key]
          .map((entry) => {
            return getEntryCss(entry);
          })
          .reduce((p, c) => p + "\n" + c)}
      }`;
      })
      .reduce((p, c) => p + "\n" + c);
    return newCss;
  };

  handleJSONAsync("read-display-settings", async (_) => activeConfig);

  ipcMain.on("req-css", (_event, index) => {
    Array(MAX_LIVE_ELEMENTS)
      .fill(0)
      .map((_, i) => {
        sendToAllDisplayWindows(`update-${i}-css`, getSpecificDisplayCss(i));
      });
  });

  ipcMain.on(
    "update-css",
    (
      _event,
      index: number,
      arrayName: DisplayConfigArrayName,
      entry: DisplayConfigEntryType,
    ) => {
      const updateeArray = (
        index == -1
          ? activeConfig!.globalDisplay
          : activeConfig!.specificDisplays[index]
      )[arrayName];

      //console.log(updateeArray.find((x) => x.key === entry.key)!)
      updateeArray.find((x) => x.key === entry.key)!.value = entry.value;
      //console.log(updateeArray.find((x) => x.key === entry.key)!)
      console.log("updated activeConfig", "wrote:", entry.value);

      fs.writeFile(
        path.join(app.getAppPath(), "config.json"),
        JSON.stringify(activeConfig),
        (err) => {
          console.log("wrote config.json", err);
        },
      );

      Array(MAX_LIVE_ELEMENTS)
        .fill(0)
        .map((_, i) => {
          sendToAllDisplayWindows(`update-${i}-css`, getSpecificDisplayCss(i));
        });
    },
  );

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
