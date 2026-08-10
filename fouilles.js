const initApp = async () => {
    const selectAnnee = document.getElementById('annee')
    const selectCategorie = document.getElementById('categorie')
    const selectUnitesStrat = document.getElementById('uniteStrat')
    let years = []
    let categories = []
    let unitesStrat = []

    try {
        const data = await window.api.dbGetAll('fouilles')
        if (data && data.length > 0) {
            data.forEach(element => {
                let yearExists = false
                let categorieExists = false
                let uniteStratExists = false

                const { date, categorie, us } = element

                // get every existing years
                if (date !== null) {
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
                if (categorie && categorie !== 'Categorie') {
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
                if (us !== null) {
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
                
            // Clear current options
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
    } catch (err) {
        console.error('Error initializing app:', err)
    }
    document.getElementById('map').style.visibility = "hidden"
    document.getElementById('dataTable').style.visibility = "hidden"
}

// Set up listeners for updates from Main process
if (window.api) {
    window.api.onFouillesLoad(() => {
        initApp()
    })
    window.api.onCarroyageLoad(() => {
        // Option to reload map/ui if carroyage changes
        initApp()
    })
}

const selectorCheck = async () => {
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
    
    try {
        let data = []
        if (yearSelected && categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', {
                date: year,
                categorie: categorie,
                us: stratUnit
            })
        } else if (yearSelected && categorieSelected) {
            data = await window.api.dbGetRows('fouilles', {
                date: year,
                categorie: categorie
            })
        } else if (categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', {
                categorie: categorie,
                us: stratUnit
            })
        } else if (yearSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', {
                date: year,
                us: stratUnit
            })
        } else if (yearSelected) {
            data = await window.api.dbGetRows('fouilles', {
                date: year
            })
        } else if (categorieSelected) {
            data = await window.api.dbGetRows('fouilles', {
                categorie: categorie
            })
        } else if (uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', {
                us: stratUnit
            })
        } else {  
            data = await window.api.dbGetAll('fouilles')
        }
        selectorUpdate(data)
    } catch (err) {
        console.error(err)
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

        const { date, categorie, us } = element

        // get every existing years
        if (date !== null) {
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
        if (categorie && categorie !== 'Categorie') {
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
        if (us !== null) {
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
    if (document.getElementById('dataTitle'))
        document.getElementById('map').removeChild(document.getElementById('dataTitle'))

    const mapData = await window.api.getCarroyageJson()
    if (!mapData) {
        alert("Fichier carroyage.json introuvable. Veuillez d'abord charger le carroyage.")
        return
    }

    // load map background and data in parallel
    const [image, dataResult] = await Promise.all([
        new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = (err) => reject(err)
            img.src = './assets/img/plan-v2_2019.jpg'
        }),
        getData()
    ])

    const { data, type, title } = dataResult
    if (!data) return

    let x = 0
    let y = 0
    let zones = []
    let zoneData = []

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

    const ctx = canvas.getContext('2d')
    ctx.scale(scale, scale)

    // display map with carroyage
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
    let xSize = 1.1;
    let ySize = 0.99;
    for (let posY = -50; posY < image.height; posY += 106*ySize) {
        for (let posX = -50; posX < image.width; posX += 106*xSize) {
            if (x == 8) {
                xSize = 1.80;
            } else {
                xSize = 1.07;
            }
            ctx.strokeStyle = 'rgb(0, 0, 0)'
            ctx.strokeRect(posX, posY, 106*xSize, 106*ySize)
            ctx.fillStyle = 'black'
            ctx.font = '36px arial'
            
            // display data on map
            if (mapData.carroyage[y] && mapData.carroyage[y][x] && mapData.carroyage[y][x] != ".") {
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
                        ctx.fillRect(posX, posY, 106*xSize, 106*ySize) 
                    }                                    
                }
            }
            x++
        }
        y++
        x = 0
    }

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

const getData = async () => {
    const yearSelected = document.getElementById('yearSelected').checked
    const categorieSelected = document.getElementById('categorieSelected').checked
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked

    if (!yearSelected && !categorieSelected && !uniteStratSelected) {
        alert(`Veuillez sélectionner au moins un critère.`)
        return { 'title': null, 'data': [], 'type': null }
    }

    let year = null
    let categorie = null
    let stratUnit = null

    if (yearSelected) {
        year = parseInt(document.getElementById('annee').value)        
    }
    if (categorieSelected) {
        categorie = document.getElementById('categorie').value      
    }
    if (uniteStratSelected) {
        stratUnit = document.getElementById('uniteStrat').value.toString()     
    }
    
    let data = []
    let title = ""
    let type = "mono"

    try {
        if (yearSelected && categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie, us: stratUnit })
            title = `Année ${year}, catégorie ${categorie}, US ${stratUnit}`
            type = 'multi'
        } else if (yearSelected && categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie })
            title = `Année ${year}, catégorie ${categorie}`
            type = 'multi'
        } else if (categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie, us: stratUnit })
            title = `Catégorie ${categorie}, US ${stratUnit}`
            type = 'multi'
        } else if (yearSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, us: stratUnit })
            title = `Année ${year}, US ${stratUnit}`
            type = 'mono'
        } else if (yearSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year })
            title = `Année ${year}`
            type = 'mono'
        } else if (categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie })
            title = `Catégorie ${categorie}`
            type = 'multi'
        } else if (uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { us: stratUnit })
            title = `US ${stratUnit}`
            type = 'mono'
        }
    } catch (err) {
        console.error(err)
    }

    return { title, data, type }
}

const displayData = async () => {
    const dataTable = document.createElement('table')
    const dataTitle = document.createElement('h2')
    let zoneData = []
    
    // hidde map
    document.getElementById('map').style.visibility = "hidden"

    // init table data header and border
    dataTable.style.border = "thin solid #337ab7"
    dataTable.className = "table table-striped"
    const tableHeader = dataTable.createTHead()
    let rowHeader = tableHeader.insertRow(0)
    rowHeader.style.border = "thin solid #337ab7"
    let cellHeader = rowHeader.insertCell(0)
    cellHeader.innerHTML = "<strong>Zone</strong>"

    const { data, type, title } = await getData()
    if (!data) return

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
        rowHeader.insertCell(1).innerHTML = "<strong>Quantité</strong>"        
    } else {
        let zones = zoneData
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

        const row = dataTable.insertRow()
        const cell = row.insertCell(0)
        cell.innerHTML = zone
        if (quantite > 0) {
            row.insertCell(1).innerHTML = quantite
        }
    })
    
    dataTitle.innerHTML = title

    document.getElementById('dataTable').innerHTML = ""
    document.getElementById('dataTable').appendChild(dataTitle)
    document.getElementById('dataTable').appendChild(dataTable)
    document.getElementById('dataTable').style.visibility = "visible"
}

const downloadCanvas = () => {
    const canvas = document.querySelector('#carroyage')
    const link = document.querySelector('a#download')
    link.href = canvas.toDataURL('image/png')
}