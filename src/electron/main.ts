import { app, protocol, net, BrowserWindow, ipcMain, dialog } from "electron";
import url from "node:url";
import path from "path";
import { isDev } from "./util.js";
import { getConfigPath, getPreloadPath } from "./pathResolver.js";
import { readMSSFile, writeMSSFile } from "./parser.js";
//import { promises as fsp } from "fs";
import * as fs from "fs";

// TODO: make this one variable for electron and react
const MAX_LIVE_ELEMENTS = 4;
const liveElements: any[] = [];
let logo: boolean = false; // FIXME: hardcoded to start at false. how do i do this better?

let activeConfig: FullDisplayConfigType | null = null;

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

    this.window.webContents.on("before-input-event", (event, input) => {
      if (input.key.toLowerCase() === "i") {
        this.window.webContents.openDevTools();
      }
    });
    this.window.setMenu(null);

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
  return new Promise<number>((resolve, reject) => {
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

const sendLiveElement = (index: number, liveElement: LiveElementType) => {
  if (liveElement.type === "text") {
    sendToAllDisplayWindows(`display-${index}-text`, liveElement.value);
  }
  if (liveElement.type === "image") {
    sendToAllDisplayWindows(`display-${index}-image`, liveElement.value);
  }
  if (liveElement.type === "none") {
    sendToAllDisplayWindows(`display-${index}-none`, undefined);
  }
};

ipcMain.on("set-logo", (_event, value) => {
  logo = value;
  sendToAllDisplayWindows("display-logo", value);
});

ipcMain.handle("get-logo", (_event, index: number) => {
  return logo;
});

ipcMain.on(
  "set-live-element",
  (_event, data: { index: number; liveElement: LiveElementType }) => {
    console.log(data);
    liveElements[data.index] = data.liveElement;
    sendLiveElement(data.index, data.liveElement);
  },
);

ipcMain.on("get-live-element", (_event, index: number) => {
  if (liveElements[index]) {
    sendLiveElement(index, liveElements[index]);
  }
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
          key: "Logo Image",
          css: "--logo-image",
          special: true,
          type: "path",
          default: null,
          value: null,
        },
        {
          key: "Logo Scale",
          css: "--logo-scale",
          special: false,
          type: "number",
          default: 50,
          unit: "%",
          value: null,
        },
        {
          key: "Background Color",
          css: "background-color",
          type: "csscolor",
          default: "black",
          value: null,
        },
        {
          key: "Background Image",
          css: "background-image",
          special: true,
          type: "path",
          default: null,
          value: null,
        },
        {
          key: "Transition length (ms)",
          css: "--default-animation-length",
          type: "number",
          default: 0,
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
      fs.readFileSync(getConfigPath(), "utf8"),
    );

    const curConfig = makeDefaultFullConfig();

    updateDisplay(curConfig.globalDisplay, fConfig.globalDisplay);
    for (let i = 0; i < MAX_LIVE_ELEMENTS; i++) {
      updateDisplay(curConfig.specificDisplays[i], fConfig.specificDisplays[i]);
    }

    return curConfig;
  } catch (err) {
    fs.writeFileSync(
      getConfigPath(),
      JSON.stringify(makeDefaultFullConfig()),
    );
    return makeDefaultFullConfig();
  }
};

/* FIXME: chatgpt code. beware */
protocol.registerSchemesAsPrivileged([
  {
    scheme: "mssf",
    privileges: { secure: true, standard: true, supportFetchAPI: true },
  },
]);

app.on("ready", () => {
  /* FIXME: chatgpt code. beware */
  protocol.handle("mssf", async (request) => {
    const url = new URL(request.url);
    const filePath = path.resolve(
      path.normalize(decodeURIComponent(url.pathname)),
    );

    try {
      await fs.promises.access(filePath, fs.constants.R_OK);
      const fileBuffer = await fs.promises.readFile(filePath);
      return new Response(fileBuffer, { status: 200 });
    } catch {
      return new Response("File Not Found", { status: 404 });
    }
  });

  //loading settings **blocking**

  const mainWindow = new BrowserWindow({
    minWidth: 400,
    minHeight: 400,
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
        console.log(entry);
        let value: any;
        switch (entry.key) {
          case "Bold":
            value = entry.value !== null ? entry.value : entry.default;
            if (value) {
              return "font-weight: bold;";
            } else {
              return "";
            }
            break;

          case "Background Image":
            value = entry.value !== null ? entry.value : entry.default;
            value = value !== null ? value : "";
            value = (value as string).replace(/\\/g, "/");
            value = "file:///" + value;
            console.log("value:", entry.value, value);
            return `${entry.css}: url("${value}");`;
            break;

          case "Logo Image":
            value = entry.value !== null ? entry.value : entry.default;
            value = value !== null ? value : "";
            value = (value as string).replace(/\\/g, "/");
            value = "file:///" + value;
            console.log("value:", entry.value, value);
            return `${entry.css}: url("${value}");`;
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
        //return `${key === "root" ? ":root" : `.d-${index}-${key}`} {
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
        sendToAllDisplayWindows(`res-${i}-css`, getSpecificDisplayCss(i));
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

      updateeArray.find((x) => x.key === entry.key)!.value = entry.value;
      console.log("updated activeConfig", "wrote:", entry.key, entry.value);

      fs.writeFile(
        getConfigPath(),
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

ipcMain.handle("read-element", (_event) => {
  return new Promise((resolve: (arg0: OpenElementType) => any, reject) => {
    dialog.showOpenDialog({ properties: ["openFile"] }).then((result) => {
      if (!result.canceled) {
        const fp = result.filePaths[0];
        const bn = path.basename(fp);
        if (bn.match(/\.(txt|mss)$/)) {
          readMSSFile(fp).then(
            (s) => {
              resolve({ type: "song", song: s, selected: {object: null, verseID: 0, sectionID: 0} });
            },
            (e) => {
              dialog.showErrorBox(`Error reading song ${bn}.`, e.message);
              reject();
            },
          );
        } else if (
          bn.match(/\.(apng|png|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|svg|webp)$/)
        ) {
          resolve({
            type: "image",
            image: { path: fp.replace(/\\/g, "/"), title: bn },
          });
        } else {
          dialog.showErrorBox("Error reading file: ", bn);
          reject();
        }
      }
    });
  });
});

ipcMain.handle("read-image", (_event) => {
  return new Promise((resolve, _reject) => {
    dialog
      .showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
      })
      .then((result) => {
        if (!result.canceled) {
          resolve(result.filePaths[0]);
        }
      });
  });
});
