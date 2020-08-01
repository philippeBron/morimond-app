const electron = require('electron')
const url = require('url')
const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = electron

// Set environment
process.env.NODE_ENV = 'production'

let mainWindow;
let loadWindow

// Listen for app to be ready
app.on('ready', () => {
    // Create a new window
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 1024,
        webPreferences: {
            nodeIntegration: true
        }
    })
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Quit app when closed
    mainWindow.on('closed', () => {
        app.quit()
    })

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
    //Insert menu
    Menu.setApplicationMenu(mainMenu)
})

// Handle new window
function createAddWindow() {
    loadWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Chargement des données',
        webPreferences: {
            nodeIntegration: true
        }
    })
    loadWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'loadWindow.html'),
        protocol: 'file:',
        slashes: true        
    }))

    // Clear loadWindow on quit
    loadWindow.on('close', ()   => {
        loadWindow = null
    })
}

// Catch load:file
ipcMain.on('file:load', (e, file) => {
    console.log(file)
    mainWindow.webContents.send('file:load', file)
    loadWindow.close()
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Chargment',
                click(){
                    createAddWindow()
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
    }
]

// Fixes menu template on Mac (add emty object)
if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({})
}

// Add developer tools item menu if not in production
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