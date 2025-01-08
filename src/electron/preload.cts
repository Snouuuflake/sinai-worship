const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  testFunction: () => console.log("Hello, World!"),
  sendNewDisplayWindow: (index: number) => {
    electron.ipcRenderer.send("new-display-window", index);
  },
  invokeIndex: () => electron.ipcRenderer.invoke("invoke-index")
});
