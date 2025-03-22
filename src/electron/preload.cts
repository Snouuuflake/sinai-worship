const electron = require("electron");

/**
 * Stupid function that returns a remove listener function for use with useEffect
 * @param
 */
const useIpcListener = (
  channel: string,
  callback: (...args: any[]) => void,
) => {
  const listener = (_event: Electron.IpcRendererEvent, ...largs: any[]) => {
    callback(...largs);
  };
  electron.ipcRenderer.on(channel, listener);
  return () => {
    electron.ipcRenderer.removeListener(channel, listener);
  };
};

const ipcInvokeJSON = (channel: string, obj: any) => {
  return new Promise<any>((resolve) => {
    electron.ipcRenderer
      .invoke(channel, JSON.stringify(obj))
      .then((jsonRes) => resolve(JSON.parse(jsonRes)));
  });
};

const makeInvokeJSON = (channel: string) => {
  return (obj: any) => ipcInvokeJSON(channel, obj)
}

const makeIpcSend = (channel: string) => {
  return (...args: any[]) => electron.ipcRenderer.send(channel, ...args)
}



electron.contextBridge.exposeInMainWorld("electron", {
  // for react
  invokeReadSong: (callback: (song: Song) => void) => {
    electron.ipcRenderer.invoke("read-song").then(
      (s) => {
        callback(s);
      },
      (e) => {
        console.error(e);
      },
    );
  },
  invokeSaveSong: (song: Song): Promise<void> => {
    return electron.ipcRenderer.invoke("save-song", song) as Promise<void>;
  },

  /**
   * @param {number} index Display index
   */
  sendSetLiveElement: (index: number, liveElement: LiveElementType) => {
    electron.ipcRenderer.send("set-live-element", {
      index: index,
      liveElement: liveElement,
    });
  },
  invokeImagePath: (): Promise<string> => {
    return electron.ipcRenderer.invoke("read-image") as Promise<string>;
  },

  invokeReadDisplaySetting: makeInvokeJSON("read-display-settings"),

  // for display window
  testFunction: () => console.log("Hello, World!"),
  sendNewDisplayWindow: (index: number) => {
    electron.ipcRenderer.send("new-display-window", index);
  },
  sendAlert: (message: string) => {
    electron.ipcRenderer.send("alert", message);
  },
  invokeIndex: () => electron.ipcRenderer.invoke("invoke-index"),
  sendReqCss: (index: number) => {
    electron.ipcRenderer.send("req-css", index);
  },
  sendUpdateCss: (
      index: number,
      arrayName: DisplayConfigArrayName,
      entry: DisplayConfigEntryType,
  ) => {
    electron.ipcRenderer.send("update-css", index, arrayName, entry)
  },
  onResCss: (index: number, callback: (css: string) => void) => {
    electron.ipcRenderer.on(`res-${index}-css`, (_event, data) =>
      callback(data),
    );
  },
  onUpdateCss: (index: number, callback: (css: string) => void) => {
    electron.ipcRenderer.on(`update-${index}-css`, (_event, data) =>
      callback(data),
    );
  },
  onDisplayText: (index: number, callback: (text: string) => void) => {
    electron.ipcRenderer.on(`display-${index}-text`, (_event, data) => {
      callback(data);
    });
  },
  onDisplayImage: (index: number, callback: (path: string) => void) => {
    electron.ipcRenderer.on(`display-${index}text`, (_event, data) => {
      callback(data);
    });
  },
});
