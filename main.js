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
        width: 1200,
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

// Catch data:file
ipcMain.on('data:load', (e, file) => {
    loadDB(file)
    // mainWindow.webContents.send('data:load', file)
    // loadWindow.close()
})

// Catch carroyage:file
ipcMain.on('carroyage:load', (e, file) => {
    console.log(file)
    mainWindow.webContents.send('carroyage:load', file)
    loadWindow.close()
})

// Create menu template
const mainMenuTemplate = [
    {
        label: 'Fichier',
        submenu: [
            {
                label: 'Chargment des données',
                click(){
                    loadDB('./base_de_donnees_compilee.xlsx')
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

function loadDB(file) {
    const readXLsxFile = require('read-excel-file/node')
    const db = require('electron-db')
    const location = path.join(__dirname, './')
    db.createTable('fouilles', location, (succ, msg) => {
        console.log("Success: " + succ)
        console.log("Message: " + msg)
    })

    if(db.valid('fouilles', location)) {         
        db.clearTable('fouilles', location, (succ, msg) => {
            console.log(`Success: ${succ}`)
            console.log(`Message: ${msg}`)
        })
    }

    readXLsxFile(file).then((rows) => {
        rows.forEach(element => {
            let obj = new Object()

            obj.zone = element[0]
            obj.categorie = element[1]
            obj.sousCategorie = element[2]
            obj.quantite = element[3]
            obj.complement = element[4]
            obj.us = element[5]
            obj.date = ExcelDateToJSDate(element[6]).getFullYear()

            console.log(obj)
            
            if(db.valid('fouilles', location)) {
                db.insertTableContent('fouilles', location, obj, (succ, msg) => {
                    console.log(`Success: ${succ}`)
                    console.log(`Message: ${msg}`)
                })
            }
        })
    })
}

function ExcelDateToJSDate(serial) {
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