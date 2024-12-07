const electron = require("electron");

electron.contextBridge.exposeInMainWorld("electron", {
  testFunction: () => "Hello, World!"
});
