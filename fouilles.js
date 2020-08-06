function initApp() {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, './')
    const selectAnnee = document.getElementById('annee')
    const selectAnnee2 = document.getElementById('annee2')
    const selectCategorie = document.getElementById('categorie')
    const selectCategorie2 = document.getElementById('categorie2')
    const divMap = document.getElementById('map')
    let years = []
    let categories = []

    if(db.valid('fouilles', location)) {         
        db.getAll('fouilles', location, (succ, data) => {
            if(succ) {        
                data.forEach(element => {
                    let yearExists = false
                    let categorieExists = false
                    if(element.date !== null) {
                        for (let i = 0; i < years.length; i++) {
                            if (element.date === years[i]) {
                                yearExists = true
                            }
                        }
                        if (yearExists === false) {
                            years.push(element.date)
                        }
                    }
                    // sort years
                    years.sort()
                    //reverse years order
                    years.reverse()
                    if(element.categorie !== 'Categorie') {
                        for (let i = 0; i < categories.length; i++) {
                            if (element.categorie.toLowerCase() === categories[i]) {
                                categorieExists = true
                            }
                        }
                        if (categorieExists === false) {
                            categories.push(element.categorie.toLowerCase())
                        }
                    }
                    categories.sort()              
                })
                    
                years.forEach(year => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = year
                    selectAnnee.appendChild(opt)
                })                
                years.forEach(year => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = year
                    selectAnnee2.appendChild(opt)
                })
                    
                categories.forEach(categorie => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = categorie
                    selectCategorie.appendChild(opt)
                })                
                categories.forEach(categorie => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = categorie
                    selectCategorie2.appendChild(opt)
                })
            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
            }
        })
    }
    divMap.style.visibility = "hidden"
}

function getAll() {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    if(db.valid('fouilles', location)) {
        db.getAll('fouilles', location, (succ, data) => {
            if(succ) {
                console.log(`Message: ${data}`)
            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
            }
        })
    }
}

function getItems(year) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    let zones = []
    let zonesList = []
            
    if(db.valid('fouilles', location)) {
        db.getRows('fouilles', location, {
            date: year
        }, (succ, data) => {
            if(succ) {                
                data.forEach(element => {
                    let exists = false

                    if (element.zone !== 'Zone') {
                        for (let i = 0; i < zones.length; i++) {
                            if (element.zone === zones[i]) {
                                exists = true
                            }
                        }
                        if (exists === false) {
                            zones.push(element.zone)
                        }
                    }
                });
                zones.sort()
                for (let index = 0; index < zones.length; index++) {
                    let obj = new Object()

                    obj.zone = zones[index]
                    obj.quantite = 0

                    zonesList.push(obj)
                    
                }
                return zonesList
            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
                return null
            }
        })
    }
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

function showYearMap(annee, scale) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    const canvas = document.querySelector('#carroyage')
    const divMap = document.getElementById('map')
    const width = canvas.width = (4218)
    const height = canvas.height = (5318)

    // load map background
    const image = new Image()
    image.src = './assets/img/plan-v2_2019.jpg'

    let x = y = 0;

    const mapData = require('./carroyage.json')
    const year = parseInt(document.getElementById(annee).value)

    // get data
    let zones = []
    let zoneData = []
    
    // get data from database
    if(db.valid('fouilles', location)) {
        db.getRows('fouilles', location, {
            date: year
        }, (succ, data) => {
            if(succ) {                
                data.forEach(element => {
                    let exists = false

                    if (element.zone !== 'Zone') {
                        for (let i = 0; i < zones.length; i++) {
                            if (element.zone === zones[i]) {
                                exists = true
                            }
                        }
                        if (exists === false) {
                            zones.push(element.zone)
                        }
                    }
                })
                zones.sort()
                for (let index = 0; index < zones.length; index++) {
                    let obj = new Object()

                    obj.zone = zones[index]
                    obj.quantite = 0

                    zoneData.push(obj)                    
                }
            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
                return null
            }
        })
    }

    const ctx = canvas.getContext('2d');

    // display map with carroyage
    image.onload = function() {
        // display map background
        ctx.drawImage(image, 0, 0);

        // draw grid
        for (let posY = -10; posY < image.height; posY += 106) {
            for (let posX = 15; posX < image.width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.strokeRect(posX, posY, 106, 106);
                ctx.fillStyle = 'black';
                ctx.font = '36px arial';
                
                // display data on map
                if (mapData.carroyage[y][x] != ".") {
                    ctx.fillText(mapData.carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == mapData.carroyage[y][x]) {
                            if (zoneData[index].quantite == 0){
                                ctx.fillStyle = 'rgba(0,255,0, 0.50)';
                            } else if (zoneData[index].quantite < 6) {
                                ctx.fillStyle = 'rgba(254, 254, 177, 0.80)';                                        
                            } else if (zoneData[index].quantite >= 6 && zoneData[index].quantite < 11) {
                                ctx.fillStyle = 'rgba(253, 175, 79, 0.80)';                        
                            } else if (zoneData[index].quantite >= 11 && zoneData[index].quantite < 16) {
                                ctx.fillStyle = 'rgba(237, 80, 40, 0.80)';
                            } else  if (zoneData[index].quantite >= 16) {
                                ctx.fillStyle = 'rgba(100, 23, 14, 0.80)';
                            }
                            ctx.fillRect(posX, posY, 106, 106);
                        }                                    
                    }
                }
                x++;
            }
            y++;
            x = 0;
        }
    }

    // set scale
    ctx.scale(scale, scale)

    // show map
    divMap.style.visibility = "visible"
}

function showCategorieMap(categorie, scale) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    const canvas = document.querySelector('#carroyage')
    const divMap = document.getElementById('map')
    const width = canvas.width = (4218);
    const height = canvas.height = (5318);
    
    // load map background
    const image = new Image();
    image.src = './assets/img/plan-v2_2019.jpg'

    let x = y = 0;

    const mapData = require('./carroyage.json')

    let zoneData = []
    
    // get data from database            
    if(db.valid('fouilles', location)) {
        db.getRows('fouilles', location, {
            categorie: document.getElementById(categorie).value
        }, (succ, data) => {
            if(succ) {
                
                data.forEach(element => {
                    let exists = false
                    let obj = new Object()

                    if (element.zone !== 'Zone') {
                        for (let i = 0; i < zoneData.length; i++) {
                            if (element.zone === zoneData[i].zone) {
                                exists = true
                                zoneData[i].quantite += element.quantite
                            }
                        }
                        if (exists === false) {
                            obj.zone = element.zone
                            obj.quantite = element.quantite
                            zoneData.push(obj)
                        }
                    }
                });
                zoneData.sort()

            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
                return null
            }
        })
    }

    const ctx = canvas.getContext('2d');

    // display map with carroyage
    image.onload = function() {
        // display map background
        ctx.drawImage(image, 0, 0);
        
        // legende des couleurs
        ctx.fillStyle = 'rgba(254, 254, 177, 0.80)';
        ctx.fillRect(15 + (20*106), -10 + (3*106), 106, 106);
        ctx.fillStyle = 'black';
        ctx.font = '36px arial';
        ctx.fillText("de 1 à 5", 15 + (21*106) + 15, -10 + (3*106) + 65);
        ctx.fillStyle = 'rgba(253, 175, 79, 0.80)';
        ctx.fillRect(15 + (20*106), -10 + (4*106), 106, 106);
        ctx.fillStyle = 'black';
        ctx.font = '36px arial';
        ctx.fillText("de 6 à 10", 15 + (21*106) + 15, -10 + (4*106) + 65);
        ctx.fillStyle = 'rgba(237, 80, 40, 0.80)';
        ctx.fillRect(15 + (20*106), -10 + (5*106), 106, 106);
        ctx.fillStyle = 'black';
        ctx.font = '36px arial';
        ctx.fillText("de 11 à 15", 15 + (21*106) + 15, -10 + (5*106) + 65);
        ctx.fillStyle = 'rgba(100, 23, 14, 0.80)';
        ctx.fillRect(15 + (20*106), -10 + (6*106), 106, 106);
        ctx.fillStyle = 'black';
        ctx.font = '36px arial';
        ctx.fillText("supérieur à 16", 15 + (21*106) + 15, -10 + (6*106) + 65);

        // draw grid
        for (let posY = -10; posY < image.height; posY += 106) {
            for (let posX = 15; posX < image.width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                ctx.strokeRect(posX, posY, 106, 106);
                ctx.fillStyle = 'black';
                ctx.font = '36px arial';
                
                // display data on map
                if (mapData.carroyage[y][x] != ".") {
                    ctx.fillText(mapData.carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == mapData.carroyage[y][x]) {
                            if (zoneData[index].quantite == 0){
                                ctx.fillStyle = 'rgba(0,255,0, 0.50)';
                            } else if (zoneData[index].quantite < 6) {
                                ctx.fillStyle = 'rgba(254, 254, 177, 0.80)';                                        
                            } else if (zoneData[index].quantite >= 6 && zoneData[index].quantite < 11) {
                                ctx.fillStyle = 'rgba(253, 175, 79, 0.80)';                        
                            } else if (zoneData[index].quantite >= 11 && zoneData[index].quantite < 16) {
                                ctx.fillStyle = 'rgba(237, 80, 40, 0.80)';
                            } else  if (zoneData[index].quantite >= 16) {
                                ctx.fillStyle = 'rgba(100, 23, 14, 0.80)';
                            }
                            ctx.fillRect(posX, posY, 106, 106);
                        }                                    
                    }
                }
                x++;
            }
            y++;
            x = 0;
        }
    }
    
    // set scale
    ctx.scale(scale, scale)

    // show map
    divMap.style.visibility = "visible"
}

function showYearCategorieMap(annee, categorie, scale) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    const canvas = document.querySelector('#carroyage')
    const divMap = document.getElementById('map')
    canvas.width = (4218)
    canvas.height = (5318)

    // load map
    const image = new Image()
    image.src = './assets/img/plan-v2_2019.jpg'

    let x = y = 0

    const year = parseInt(document.getElementById(annee).value)
    const mapData = require('./carroyage.json')

    let zoneData = []
            
    if(db.valid('fouilles', location)) {
        db.getRows('fouilles', location, {
            date: year,
            categorie: document.getElementById(categorie).value
        }, (succ, data) => {
            if(succ) {
                
                data.forEach(element => {
                    let exists = false
                    let obj = new Object()

                    if (element.zone !== 'Zone') {
                        for (let i = 0; i < zoneData.length; i++) {
                            if (element.zone === zoneData[i].zone) {
                                exists = true
                                zoneData[i].quantite += element.quantite
                            }
                        }
                        if (exists === false) {
                            obj.zone = element.zone
                            obj.quantite = element.quantite
                            zoneData.push(obj)
                        }
                    }
                });
                zoneData.sort()

            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
                return null
            }
        })
    }

    const ctx = canvas.getContext('2d')

    // display map with carroyage
    image.onload = function() {
        ctx.drawImage(image, 0, 0)
        
        // legende des couleurs
        ctx.fillStyle = 'rgba(254, 254, 177, 0.80)'
        ctx.fillRect(15 + (20*106), -10 + (3*106), 106, 106)
        ctx.fillStyle = 'black'
        ctx.font = '36px arial'
        ctx.fillText("de 1 à 5", 15 + (21*106) + 15, -10 + (3*106) + 65)
        ctx.fillStyle = 'rgba(253, 175, 79, 0.80)'
        ctx.fillRect(15 + (20*106), -10 + (4*106), 106, 106)
        ctx.fillStyle = 'black'
        ctx.font = '36px arial'
        ctx.fillText("de 6 à 10", 15 + (21*106) + 15, -10 + (4*106) + 65)
        ctx.fillStyle = 'rgba(237, 80, 40, 0.80)'
        ctx.fillRect(15 + (20*106), -10 + (5*106), 106, 106)
        ctx.fillStyle = 'black'
        ctx.font = '36px arial'
        ctx.fillText("de 11 à 15", 15 + (21*106) + 15, -10 + (5*106) + 65)
        ctx.fillStyle = 'rgba(100, 23, 14, 0.80)'
        ctx.fillRect(15 + (20*106), -10 + (6*106), 106, 106)
        ctx.fillStyle = 'black'
        ctx.font = '36px arial'
        ctx.fillText("supérieur à 16", 15 + (21*106) + 15, -10 + (6*106) + 65)

        // draw grid
        for (let posY = -10; posY < image.height; posY += 106) {
            for (let posX = 15; posX < image.width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)'
                ctx.strokeRect(posX, posY, 106, 106)
                ctx.fillStyle = 'black'
                ctx.font = '36px arial'
                
                // display data on map
                if (mapData.carroyage[y][x] != ".") {
                    ctx.fillText(mapData.carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == mapData.carroyage[y][x]) {
                            if (zoneData[index].quantite == 0){
                                ctx.fillStyle = 'rgba(0,255,0, 0.50)'
                            } else if (zoneData[index].quantite < 6) {
                                ctx.fillStyle = 'rgba(254, 254, 177, 0.80)'
                            } else if (zoneData[index].quantite >= 6 && zoneData[index].quantite < 11) {
                                ctx.fillStyle = 'rgba(253, 175, 79, 0.80)'                        
                            } else if (zoneData[index].quantite >= 11 && zoneData[index].quantite < 16) {
                                ctx.fillStyle = 'rgba(237, 80, 40, 0.80)'
                            } else  if (zoneData[index].quantite >= 16) {
                                ctx.fillStyle = 'rgba(100, 23, 14, 0.80)'
                            }
                            ctx.fillRect(posX, posY, 106, 106)
                        }                                    
                    }
                }
                x++
            }
            y++
            x = 0
        }
    }

    // set scale
    ctx.scale(scale, scale)

    // show map
    divMap.style.visibility = "visible"
}

function downloadCanvas() {
    const download = document.getElementById('download')
    const canvas = document.getElementById('carroyage')

    const img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    download.setAttribute("href", img)
}