const electron = require("electron");

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

  /**
   * @param {number} index Display index
   */
  sendSetLiveElement: (index: number, liveElement: LiveElementType) => {
    electron.ipcRenderer.send("set-live-element", {
      index: index,
      liveElement: liveElement,
    });
  },
  // for display window
  testFunction: () => console.log("Hello, World!"),
  sendNewDisplayWindow: (index: number) => {
    electron.ipcRenderer.send("new-display-window", index);
  },
  invokeIndex: () => electron.ipcRenderer.invoke("invoke-index"),
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
