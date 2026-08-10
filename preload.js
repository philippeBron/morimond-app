const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    dbGetAll: (table) => ipcRenderer.invoke('db:getAll', table),
    dbGetRows: (table, query) => ipcRenderer.invoke('db:getRows', table, query),
    selectAndImportData: () => ipcRenderer.invoke('file:select-and-import-data'),
    selectAndImportCarroyage: () => ipcRenderer.invoke('file:select-and-import-carroyage'),
    getCarroyageJson: () => ipcRenderer.invoke('db:get-carroyage-json'),
    closeCurrentWindow: () => ipcRenderer.send('window:close'),
    onFouillesLoad: (callback) => ipcRenderer.on('fouilles:load', () => callback()),
    onCarroyageLoad: (callback) => ipcRenderer.on('carroyage:load', () => callback())
})
