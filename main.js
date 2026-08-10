const { 
    app, 
    BrowserWindow, 
    Menu, 
    ipcMain,
    dialog
} = require('electron')
const url = require('url')
const path = require('path')
const db = require('electron-db')
const readXlsxFile = require('read-excel-file/node')
const fs = require('fs')

// Set environment
process.env.NODE_ENV = 'production'

let mainWindow
let loadDataWindow
let loadCarroyageWindow
let helpWindow

const dbLocation = __dirname

const excelDateToJSDate = (serial) => {
    var utc_days  = Math.floor(serial - 25569)
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000)
 
    var fractional_day = serial - Math.floor(serial) + 0.0000001
 
    var total_seconds = Math.floor(86400 * fractional_day)
 
    var seconds = total_seconds % 60
 
    total_seconds -= seconds
 
    var hours = Math.floor(total_seconds / (60 * 60))
    var minutes = Math.floor(total_seconds / 60) % 60
 
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds)
}

// Database IPC handlers
ipcMain.handle('db:getAll', async (event, table) => {
    return new Promise((resolve, reject) => {
        if (db.valid(table, dbLocation)) {
            db.getAll(table, dbLocation, (succ, data) => {
                if (succ) resolve(data)
                else reject(data)
            })
        } else {
            resolve([])
        }
    })
})

ipcMain.handle('db:getRows', async (event, table, query) => {
    return new Promise((resolve, reject) => {
        if (db.valid(table, dbLocation)) {
            db.getRows(table, dbLocation, query, (succ, data) => {
                if (succ) resolve(data)
                else reject(data)
            })
        } else {
            resolve([])
        }
    })
})

ipcMain.handle('db:get-carroyage-json', async () => {
    try {
        const jsonPath = path.join(dbLocation, 'carroyage.json')
        if (fs.existsSync(jsonPath)) {
            const data = fs.readFileSync(jsonPath, 'utf8')
            return JSON.parse(data)
        }
        return null
    } catch (err) {
        console.error(err)
        return null
    }
})

// File import handlers
ipcMain.handle('file:select-and-import-data', async (event) => {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })
    
    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Importation annulée' }
    }
    
    const file = result.filePaths[0]
    
    try {
        // Create / Clear Table
        await new Promise((resolve, reject) => {
            db.createTable('fouilles', dbLocation, (succ, msg) => {
                if (succ) resolve()
                else reject(msg)
            })
        })
        
        if (db.valid('fouilles', dbLocation)) {
            await new Promise((resolve, reject) => {
                db.clearTable('fouilles', dbLocation, (succ, msg) => {
                    if (succ) resolve()
                    else reject(msg)
                })
            })
        }
        
        const rows = await readXlsxFile(file)
        
        for (const element of rows) {
            let obj = new Object()
            obj.zone = element[0]
            obj.categorie = element[1]
            obj.sousCategorie = element[2]
            obj.quantite = element[3]
            obj.complement = element[4]
            if (element[5] !== null) {
                obj.us = element[5].toString()                
            } else {
                obj.us = element[5]
            }
            if (element[6] !== null && typeof element[6] === 'number') {
                obj.date = excelDateToJSDate(element[6]).getFullYear()
            } else if (element[6] instanceof Date) {
                obj.date = element[6].getFullYear()
            } else {
                obj.date = null
            }
            
            if (db.valid('fouilles', dbLocation)) {
                await new Promise((resolve, reject) => {
                    db.insertTableContent('fouilles', dbLocation, obj, (succ, msg) => {
                        if (succ) resolve()
                        else reject(msg)
                    })
                })
            }
        }
        
        if (mainWindow) {
            mainWindow.webContents.send('fouilles:load')
        }
        
        return { success: true, message: 'Données de fouilles chargées avec succès !' }
    } catch (error) {
        console.error(error)
        return { success: false, message: error.message || error }
    }
})

ipcMain.handle('file:select-and-import-carroyage', async (event) => {
    const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
    })
    
    if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Importation annulée' }
    }
    
    const file = result.filePaths[0]
    
    try {
        await new Promise((resolve, reject) => {
            db.createTable('carroyage', dbLocation, (succ, msg) => {
                if (succ) resolve()
                else reject(msg)
            })
        })
        
        if (db.valid('carroyage', dbLocation)) {
            await new Promise((resolve, reject) => {
                db.clearTable('carroyage', dbLocation, (succ, msg) => {
                    if (succ) resolve()
                    else reject(msg)
                })
            })
        }
        
        const rows = await readXlsxFile(file)
        
        for (const element of rows) {
            let tab = []
            for (let index = 0; index < 40; index++) {
                tab.push(element[index])
            }
            
            if (db.valid('carroyage', dbLocation)) {
                await new Promise((resolve, reject) => {
                    db.insertTableContent('carroyage', dbLocation, tab, (succ, msg) => {
                        if (succ) resolve()
                        else reject(msg)
                    })
                })
            }
        }
        
        // Also notify the main window to update if open
        if (mainWindow) {
            mainWindow.webContents.send('carroyage:load')
        }
        
        return { success: true, message: 'Carroyage chargé avec succès !' }
    } catch (error) {
        console.error(error)
        return { success: false, message: error.message || error }
    }
})

// Listen for window close requests from renderer
ipcMain.on('window:close', (event) => {
    const webContents = event.sender
    const win = BrowserWindow.fromWebContents(webContents)
    if (win) {
        win.close()
    }
})

const getWebPreferences = () => ({
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    preload: path.join(__dirname, 'preload.js')
})

// Listen for app to be ready
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 1024,
        webPreferences: getWebPreferences()
    })
    
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    mainWindow.on('closed', () => {
        app.quit()
    })

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    Menu.setApplicationMenu(mainMenu)
})

const createHelpWindow = () => {
    helpWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Aide',
        webPreferences: getWebPreferences()
    })
    helpWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'helpWindow.html'),
        protocol: 'file:',
        slashes: true        
    }))

    helpWindow.on('close', () => {
        helpWindow = null
    })
}

const createLoadDataWindow = () => {
    loadDataWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Chargement',
        webPreferences: getWebPreferences()
    })
    loadDataWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'loadDataWindow.html'),
        protocol: 'file:',
        slashes: true        
    }))

    loadDataWindow.on('close', () => {
        loadDataWindow = null
    })
}

const createLoadCarroyageWindow = () => {
    loadCarroyageWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Chargement',
        webPreferences: getWebPreferences()
    })
    loadCarroyageWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'loadCarroyageWindow.html'),
        protocol: 'file:',
        slashes: true        
    }))

    loadCarroyageWindow.on('close', () => {
        loadCarroyageWindow = null
    })
}

// Create menu template
const mainMenuTemplate = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Chargement des données',
                click() {
                    createLoadDataWindow()
                }
            },
            {
                label: 'Chargement du carroyage',
                click() {
                    createLoadCarroyageWindow()
                }
            },
            {
                label: 'Quitter',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit()
                }
            }
        ]
    },
    {
        label: 'Aide',
        submenu: [
            {
                label: 'Documentation',
                click() {
                    createHelpWindow()
                }
            }
        ]
    }
]

if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    })
}

if (process.env.NODE_ENV != 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload' 
            }
        ]
    })
}

