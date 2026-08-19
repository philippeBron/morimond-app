const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('api', {
    dbGetAll: (table) => ipcRenderer.invoke('db:getAll', table),
    dbGetRows: (table, query) => ipcRenderer.invoke('db:getRows', table, query),
    selectAndImportData: (filePath) => ipcRenderer.invoke('file:select-and-import-data', filePath),
    selectAndImportCarroyage: (filePath) => ipcRenderer.invoke('file:select-and-import-carroyage', filePath),
    getCarroyageJson: () => ipcRenderer.invoke('db:get-carroyage-json'),
    closeCurrentWindow: () => ipcRenderer.send('window:close'),
    onFouillesLoad: (callback) => ipcRenderer.on('fouilles:load', () => callback()),
    onCarroyageLoad: (callback) => ipcRenderer.on('carroyage:load', () => callback()),
    getFilePath: (file) => webUtils.getPathForFile(file)
})

