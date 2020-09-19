const { rejects } = require('assert')

const initApp = () => {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, './')
    const selectAnnee = document.getElementById('annee')
    const selectCategorie = document.getElementById('categorie')
    const selectUnitesStrat = document.getElementById('uniteStrat')
    let years = []
    let categories = []
    let unitesStrat = []

    if (db.valid('fouilles', location)) {         
        db.getAll('fouilles', location, (succ, data) => {
            if(succ) {
                data.forEach(element => {
                    let yearExists = false
                    let categorieExists = false
                    let uniteStratExists = false

                    const { date, categorie, us } = element

                    // get every existing years
                    if(date !== null) {
                        for (let i = 0; i < years.length; i++) {
                            if (date === years[i]) {
                                yearExists = true
                            }
                        }
                        if (yearExists === false) {
                            years.push(date)
                        }
                    }
                    // sort years
                    years.sort()
                    //reverse years order
                    years.reverse()

                    // get every existing categories
                    if(categorie !== 'Categorie') {
                        for (let i = 0; i < categories.length; i++) {
                            if (categorie.toLowerCase() === categories[i]) {
                                categorieExists = true
                            }
                        }
                        if (categorieExists === false) {
                            categories.push(categorie.toLowerCase())
                        }
                    }
                    categories.sort()

                    // get every existing stratigraphic units
                    if(us !== null) {
                        for (let i = 0; i < unitesStrat.length; i++) {
                            if (us.toString().toLowerCase() === unitesStrat[i]) {
                                uniteStratExists = true
                            }
                        }
                        if (uniteStratExists === false) {
                            unitesStrat.push(us.toString().toLowerCase())
                        }
                    }
                    unitesStrat.sort()
                })
                    
                years.forEach(year => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = year
                    selectAnnee.appendChild(opt)
                })
                    
                categories.forEach(categorie => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = categorie
                    selectCategorie.appendChild(opt)
                })

                unitesStrat.forEach(uniteStrat => {
                    const opt = document.createElement('option')
                    opt.value = opt.text = uniteStrat
                    selectUnitesStrat.appendChild(opt)
                })
            } else {
                console.log('An error has occured.')
                console.log(`Message: ${data}`)
            }
        })
    }
    document.getElementById('map').style.visibility = "hidden"
    document.getElementById('dataTable').style.visibility = "hidden"
}

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

 const selectorCheck = () => {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
     
    const divMap = document.getElementById('map')
    const yearSelected = document.getElementById('yearSelected').checked
    const categorieSelected = document.getElementById('categorieSelected').checked
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked
     
    let year = null
    let categorie = null
    let stratUnit = null

    // hide map when selection changed
    divMap.style.visibility = "hidden"

    // delete data table when selection changed
    document.getElementById('dataTable').innerHTML = ""


    // check selected fields
    if (yearSelected) {
        year = parseInt(document.getElementById('annee').value)        
    }
    if (categorieSelected) {
        categorie = document.getElementById('categorie').value      
    }
    if (uniteStratSelected) {
        stratUnit = document.getElementById('uniteStrat').value.toString()     
    }
    
    if(db.valid('fouilles', location)) {
        if (yearSelected && categorieSelected && uniteStratSelected) {
            db.getRows('fouilles', location, {
                date: year,
                categorie: categorie,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected && categorieSelected) {
            db.getRows('fouilles', location, {
                date: year,
                categorie: categorie
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (categorieSelected && uniteStratSelected) {
            db.getRows('fouilles', location, {
                categorie: categorie,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected && uniteStratSelected) {
            db.getRows('fouilles', location, {
                date: year,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected) {
            db.getRows('fouilles', location, {
                date: year
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (categorieSelected) {
            db.getRows('fouilles', location, {
                categorie: categorie
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (uniteStratSelected) {
            db.getRows('fouilles', location, {
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else {  
            db.getAll('fouilles', location, (succ, data) => {
                if(succ) {
                    selectorUpdate(data)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        }
    }
}

const selectorUpdate = (data) => {
    const selectAnnee = document.getElementById('annee')
    const selectCategorie = document.getElementById('categorie')
    const selectUnitesStrat = document.getElementById('uniteStrat')
    
    let years = []
    let categories = []
    let unitesStrat = []
    
    data.forEach(element => {
        let yearExists = false
        let categorieExists = false
        let uniteStratExists = false

        // get every existing years
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

        // get every existing categories
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

        // get every existing stratigraphic units
        if(element.us !== null) {
            for (let i = 0; i < unitesStrat.length; i++) {
                if (element.us.toString().toLowerCase() === unitesStrat[i]) {
                    uniteStratExists = true
                }
            }
            if (uniteStratExists === false) {
                unitesStrat.push(element.us.toString().toLowerCase())
            }
        }
        unitesStrat.sort()
    })

    // init select fields
    selectAnnee.innerHTML = ""
    selectCategorie.innerHTML = ""
    selectUnitesStrat.innerHTML = ""
        
    years.forEach(year => {
        const opt = document.createElement('option')
        opt.value = opt.text = year
        selectAnnee.appendChild(opt)
    })
        
    categories.forEach(categorie => {
        const opt = document.createElement('option')
        opt.value = opt.text = categorie
        selectCategorie.appendChild(opt)
    })

    unitesStrat.forEach(uniteStrat => {
        const opt = document.createElement('option')
        opt.value = opt.text = uniteStrat
        selectUnitesStrat.appendChild(opt)
    })
}

const showMap = (scale) => {
    const db = require('electron-db')
    const path = require('path')
    const location = path.join(__dirname, '/')
    
    const yearSelected = document.getElementById('yearSelected').checked
    const categorieSelected = document.getElementById('categorieSelected').checked
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked

    if (!yearSelected && !categorieSelected && !uniteStratSelected) {
        alert(`Veuillez sélectionner au moins un critère.`)
    }

    let year = null
    let categorie = null
    let stratUnit = null

    // check selected fields
    if (yearSelected) {
        year = parseInt(document.getElementById('annee').value)        
    }
    if (categorieSelected) {
        categorie = document.getElementById('categorie').value      
    }
    if (uniteStratSelected) {
        stratUnit = document.getElementById('uniteStrat').value.toString()     
    }
    
    if(db.valid('fouilles', location)) {
        if (yearSelected && categorieSelected && uniteStratSelected) {
            console.log(year)
            console.log(categorie)
            console.log(stratUnit)
            db.getRows('fouilles', location, {
                date: year,
                categorie: categorie,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'multi', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected && categorieSelected) {
            console.log(year)
            console.log(categorie)
            db.getRows('fouilles', location, {
                date: year,
                categorie: categorie
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'multi', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (categorieSelected && uniteStratSelected) {
            console.log(categorie)
            console.log(stratUnit)
            db.getRows('fouilles', location, {
                categorie: categorie,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'multi', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected && uniteStratSelected) {
            console.log(year)
            console.log(stratUnit)
            db.getRows('fouilles', location, {
                date: year,
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'mono', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (yearSelected) {
            console.log(year)
            db.getRows('fouilles', location, {
                date: year
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'mono', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (categorieSelected) {
            console.log(categorie)
            db.getRows('fouilles', location, {
                categorie: categorie
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'multi', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        } else if (uniteStratSelected) {
            console.log(stratUnit)
            db.getRows('fouilles', location, {
                us: stratUnit
            }, (succ, data) => {
                if(succ) {
                    displayMap(data, 'mono', scale)
                } else {
                    console.log('An error has occured.')
                    console.log(`Message: ${data}`)
                    return null
                }
            })
        }
    }
}

const displayMap = async (scale) => {
    const canvas = document.querySelector('#carroyage')
    const dlButton = document.getElementById('download')
    const dataTitle = document.createElement('h2')
    const width = canvas.width = (4218)
    const height = canvas.height = (5318)
    
    // hidde table data
    document.getElementById('dataTable').innerHTML = ""
    document.getElementById('dataTable').style.visibility = "hidden"

    // delete title
    if(document.getElementById('dataTitle'))
        document.getElementById('map').removeChild(document.getElementById('dataTitle'))

    const mapData = require('./carroyage.json')

    // load map background
    const image = new Image()
    image.src = './assets/img/plan-v2_2019.jpg'

    let x = y = 0
    let zones = []
    let zoneData = []

    const { data, type, title } = await getData()

    data.forEach(element => {
        let exists = false
        let obj = new Object()

        const { zone, quantite } = element

        if (zone !== 'Zone') {
            for (let i = 0; i < zoneData.length; i++) {
                if (zone === zoneData[i].zone) {
                    exists = true
                    zoneData[i].quantite += quantite
                }
            }
            if (exists === false) {
                obj.zone = zone
                obj.quantite = quantite
                zoneData.push(obj)
            }   
        }
    });
    
    if (type === 'mono') {
        zones = zoneData
        zoneData = []
        for (let index = 0; index < zones.length; index++) {
            let obj = new Object()

            obj.zone = zones[index].zone
            obj.quantite = 0

            zoneData.push(obj)                    
        }            
    }
    zoneData.sort()
    console.log(zoneData)

    const ctx = canvas.getContext('2d')

    // display map with carroyage
    image.onload = function() {
        ctx.drawImage(image, 0, 0)
        
        if (type === 'multi') {
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
        }

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

    dataTitle.innerHTML = title
    dataTitle.id = 'dataTitle'
    document.getElementById('map').insertBefore(dataTitle, document.getElementById('map').firstChild)
    // show map
    document.getElementById('map').style.visibility = "visible"
    
    // hide or show download button
    if (scale === 1.0) {
        dlButton.style.visibility = "visible"
    } else {
        dlButton.style.visibility = "hidden"
    }
}

const getData = () => 
    new Promise((resolve, reject) => {
        const db = require('electron-db')
        const path = require('path')
        const location = path.join(__dirname, '/')
    
        const yearSelected = document.getElementById('yearSelected').checked
        const categorieSelected = document.getElementById('categorieSelected').checked
        const uniteStratSelected = document.getElementById('uniteStratSelected').checked
    
        if (!yearSelected && !categorieSelected && !uniteStratSelected) {
            alert(`Veuillez sélectionner au moins un critère.`)
        }
    
        let year = null
        let categorie = null
        let stratUnit = null
    
        // check selected fields
        if (yearSelected) {
            year = parseInt(document.getElementById('annee').value)        
        }
        if (categorieSelected) {
            categorie = document.getElementById('categorie').value      
        }
        if (uniteStratSelected) {
            stratUnit = document.getElementById('uniteStrat').value.toString()     
        }
        
        if(db.valid('fouilles', location)) {
            if (yearSelected && categorieSelected && uniteStratSelected) {
                db.getRows('fouilles', location, {
                    date: year,
                    categorie: categorie,
                    us: stratUnit
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Année ${year}, catégorie ${categorie}, US ${stratUnit}`,
                            'data': data,
                            'type': 'multi',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (yearSelected && categorieSelected) {
                db.getRows('fouilles', location, {
                    date: year,
                    categorie: categorie
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Année ${year}, catégorie ${categorie}`,
                            'data': data,
                            'type': 'multi',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (categorieSelected && uniteStratSelected) {
                db.getRows('fouilles', location, {
                    categorie: categorie,
                    us: stratUnit
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Catégorie ${categorie}, US ${stratUnit}`,
                            'data': data,
                            'type': 'multi',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (yearSelected && uniteStratSelected) {
                db.getRows('fouilles', location, {
                    date: year,
                    us: stratUnit
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Année ${year}, US ${stratUnit}`,
                            'data': data,
                            'type': 'mono',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (yearSelected) {
                db.getRows('fouilles', location, {
                    date: year
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Année ${year}`,
                            'data': data,
                            'type': 'mono',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (categorieSelected) {
                db.getRows('fouilles', location, {
                    categorie: categorie
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `Catégorie ${categorie}`,
                            'data': data,
                            'type': 'multi',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            } else if (uniteStratSelected) {
                db.getRows('fouilles', location, {
                    us: stratUnit
                }, (succ, data) => {
                    if(succ) {
                        const result = {
                            'title': `US ${stratUnit}`,
                            'data': data,
                            'type': 'mono',
                        }
                        resolve(result)
                    } else {
                        console.log('An error has occured.')
                        console.log(`Message: ${data}`)
                        return null
                    }
                })
            }
        }
    })

const displayData = async () => {
    const dataTable = document.createElement('table')
    const dataTitle = document.createElement('h2')
    let zoneData = []
    
    // hidde map
    document.getElementById('map').style.visibility = "hidden"

    // init table data header and border
    dataTable.style.border = "thin solid #337ab7"
    const tableHeader = dataTable.createTHead()
    let rowHeader = tableHeader.insertRow(0)
    rowHeader.style.border = "thin solid #337ab7"
    let cellHeader = rowHeader.insertCell(0)
    cellHeader.innerHTML = "<strong>Zone</strong>"

    const { data, type, title } = await getData()

    data.forEach(element => {
        let exists = false
        let obj = new Object()

        const { zone, quantite } = element

        if (zone !== 'Zone') {
            for (let i = 0; i < zoneData.length; i++) {
                if (zone === zoneData[i].zone) {
                    exists = true
                    zoneData[i].quantite += quantite
                }
            }
            if (exists === false) {
                obj.zone = zone
                obj.quantite = quantite
                zoneData.push(obj)
            }   
        }
    });
    
    if (type == "multi") {
        // add quantity to data table
        rowHeader.insertCell(1).innerHTML = "<strong>Quantité</strong>"        
    } else { // type is mono and quantity is not needed
        zones = zoneData
        zoneData = []
        for (let index = 0; index < zones.length; index++) {
            let obj = new Object()

            obj.zone = zones[index].zone
            obj.quantite = 0

            zoneData.push(obj)                    
        }            
    }
    zoneData.sort()

    // fill data table
    zoneData.forEach(element => {
        const { zone, quantite } = element

        // add the zone to the data table
        row = dataTable.insertRow()
        cell = row.insertCell(0)
        cell.innerHTML = zone
        if (quantite > 0) {
            // add quantity cell to data table
            row.insertCell(1).innerHTML = quantite
        }
    })
    
    dataTitle.innerHTML = title

    document.getElementById('dataTable').innerHTML = ""
    document.getElementById('dataTable').appendChild(dataTitle)
    document.getElementById('dataTable').appendChild(dataTable)
    document.getElementById('dataTable').style.visibility = "visible"
}