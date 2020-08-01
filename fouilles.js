function loadDB(file) {
    const readXLsxFile = require('read-excel-file/node')
    const db = require('electron-db')
    const path = require('path')
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

function init() {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, './')
    const selectAnnee = document.getElementById('annee')
    const selectAnnee2 = document.getElementById('annee2')
    const selectCategorie = document.getElementById('categorie')
    const selectCategorie2 = document.getElementById('categorie2')
    let years = []
    let categories = []

    if(db.valid('fouilles', location)) {         
        db.getAll('fouilles', location, (succ, data) => {
            if(succ) {        
                data.forEach(element => {
                    let yearExists = false
                    let categorieExists = false
                    if(element.date !== 'Date') {
                        for (let i = 0; i < years.length; i++) {
                            if (element.date === years[i]) {
                                yearExists = true
                            }
                        }
                        if (yearExists === false) {
                            years.push(element.date)
                        }
                    }
                    years.sort()
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

function showYearMap(annee) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    const canvas = document.querySelector('#carroyage');
    const width = canvas.width = (4218);
    const height = canvas.height = (5318);
    let x = y = 0;

    const carroyage = require('./carroyage.json')
    const year = parseInt(document.getElementById(annee).value)

    let zones = []
    let zoneData = []
            
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

    ctx.scale(0.25, 0.25);

    // load map
    const image = new Image();
    image.src = './assets/img/plan-v2_2019.jpg';

    // display map with carroyage
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
        //ctx.fillRect(121, 96, 106, 106);
        for (let posY = -10; posY < height; posY += 106) {
            for (let posX = 15; posX < width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                //ctx.lineWidth = 3;
                ctx.strokeRect(posX, posY, 106, 106);
                ctx.fillStyle = 'black';
                ctx.font = '36px arial';
                //ctx.fillText(y+";"+x, posX+10, posY+60);
                if (carroyage[y][x] != ".") {
                    ctx.fillText(carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == carroyage[y][x]) {
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
}

function showCategorieMap(categorie) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')   
    const canvas = document.querySelector('#carroyage');
    const width = canvas.width = (4218);
    const height = canvas.height = (5318);
    let x = y = 0;

    const carroyage = require('./carroyage.json')

    let zoneData = []
            
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

    ctx.scale(0.25, 0.25);

    // load map
    const image = new Image();
    image.src = './assets/img/plan-v2_2019.jpg';

    // display map with carroyage
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
        //ctx.fillRect(121, 96, 106, 106);
        for (let posY = -10; posY < height; posY += 106) {
            for (let posX = 15; posX < width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                //ctx.lineWidth = 3;
                ctx.strokeRect(posX, posY, 106, 106);
                ctx.fillStyle = 'black';
                ctx.font = '36px arial';
                //ctx.fillText(y+";"+x, posX+10, posY+60);
                if (carroyage[y][x] != ".") {
                    ctx.fillText(carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == carroyage[y][x]) {
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
}

function showYearCategorieMap(annee, categorie) {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    const canvas = document.querySelector('#carroyage');
    const width = canvas.width = (4218);
    const height = canvas.height = (5318);
    let x = y = 0;

    const year = parseInt(document.getElementById(annee).value)
    const carroyage = require('./carroyage.json')

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

    const ctx = canvas.getContext('2d');

    ctx.scale(0.25, 0.25);

    // load map
    const image = new Image();
    image.src = './assets/img/plan-v2_2019.jpg';

    // display map with carroyage
    image.onload = function() {
        ctx.drawImage(image, 0, 0);
        //ctx.fillRect(121, 96, 106, 106);
        for (let posY = -10; posY < height; posY += 106) {
            for (let posX = 15; posX < width; posX += 106) {
                ctx.strokeStyle = 'rgb(0, 0, 0)';
                //ctx.lineWidth = 3;
                ctx.strokeRect(posX, posY, 106, 106);
                ctx.fillStyle = 'black';
                ctx.font = '36px arial';
                //ctx.fillText(y+";"+x, posX+10, posY+60);
                if (carroyage[y][x] != ".") {
                    ctx.fillText(carroyage[y][x], posX+30, posY+65);
                    for (let index = 0; index < zoneData.length; index++) {
                        if (zoneData[index].zone == carroyage[y][x]) {
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
}

