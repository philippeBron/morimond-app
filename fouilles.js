// State variables for interactive map
let zoom = 0.12;
let panX = 20;
let panY = 20;
let isDragging = false;
let startX = 0, startY = 0;
let mapImage = null;
let currentMapData = null; // carroyage.json
let currentFouillesData = null; // last queried data
let drawnCells = []; // grid coordinate mapping

// Chart instances
let categoryChartInstance = null;
let yearChartInstance = null;
let tableRowsData = [];

// Initialize App
const initApp = async () => {
    const selectAnnee = document.getElementById('annee');
    const selectCategorie = document.getElementById('categorie');
    const selectUnitesStrat = document.getElementById('uniteStrat');
    let years = [];
    let categories = [];
    let unitesStrat = [];

    try {
        const data = await window.api.dbGetAll('fouilles');
        if (data && data.length > 0) {
            data.forEach(element => {
                let yearExists = false;
                let categorieExists = false;
                let uniteStratExists = false;

                const { date, categorie, us } = element;

                // get every existing years
                if (date !== null) {
                    for (let i = 0; i < years.length; i++) {
                        if (date === years[i]) {
                            yearExists = true;
                        }
                    }
                    if (yearExists === false) {
                        years.push(date);
                    }
                }

                // get every existing categories
                if (categorie && categorie !== 'Categorie') {
                    for (let i = 0; i < categories.length; i++) {
                        if (categorie.toLowerCase() === categories[i]) {
                            categorieExists = true;
                        }
                    }
                    if (categorieExists === false) {
                        categories.push(categorie.toLowerCase());
                    }
                }

                // get every existing stratigraphic units
                if (us !== null) {
                    for (let i = 0; i < unitesStrat.length; i++) {
                        if (us.toString().toLowerCase() === unitesStrat[i]) {
                            uniteStratExists = true;
                        }
                    }
                    if (uniteStratExists === false) {
                        unitesStrat.push(us.toString().toLowerCase());
                    }
                }
            });

            // sort and format
            years.sort((a, b) => b - a);
            categories.sort();
            unitesStrat.sort();

            // Clear current options
            selectAnnee.innerHTML = "";
            selectCategorie.innerHTML = "";
            selectUnitesStrat.innerHTML = "";

            years.forEach(year => {
                const opt = document.createElement('option');
                opt.value = opt.text = year;
                selectAnnee.appendChild(opt);
            });

            categories.forEach(categorie => {
                const opt = document.createElement('option');
                opt.value = opt.text = categorie;
                selectCategorie.appendChild(opt);
            });

            unitesStrat.forEach(uniteStrat => {
                const opt = document.createElement('option');
                opt.value = opt.text = uniteStrat;
                selectUnitesStrat.appendChild(opt);
            });

            // Update stats badge
            document.getElementById('db-status-badge').textContent = `${data.length} fiches`;
            document.getElementById('db-status-badge').style.background = 'rgba(16, 185, 129, 0.2)';
            document.getElementById('db-status-badge').style.color = '#10b981';
        } else {
            document.getElementById('db-status-badge').textContent = 'Vide';
            document.getElementById('db-status-badge').style.background = 'rgba(239, 68, 68, 0.2)';
            document.getElementById('db-status-badge').style.color = '#ef4444';
        }
    } catch (err) {
        console.error('Error initializing app:', err);
    }

    setupCanvasInteraction();
    setupDragAndDrop();
    generateStats(); // Render initial stats dashboard
};

// Set up listeners for updates from Main process
if (window.api) {
    window.api.onFouillesLoad(() => {
        initApp();
    });
    window.api.onCarroyageLoad(() => {
        initApp();
    });
}

// Selector updates based on active filters
const selectorCheck = async () => {
    const yearSelected = document.getElementById('yearSelected').checked;
    const categorieSelected = document.getElementById('categorieSelected').checked;
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked;

    let year = null;
    let categorie = null;
    let stratUnit = null;

    if (yearSelected) {
        year = parseInt(document.getElementById('annee').value);
    }
    if (categorieSelected) {
        categorie = document.getElementById('categorie').value;
    }
    if (uniteStratSelected) {
        stratUnit = document.getElementById('uniteStrat').value.toString();
    }

    try {
        let data = [];
        if (yearSelected && categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie, us: stratUnit });
        } else if (yearSelected && categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie });
        } else if (categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie, us: stratUnit });
        } else if (yearSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, us: stratUnit });
        } else if (yearSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year });
        } else if (categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie });
        } else if (uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { us: stratUnit });
        } else {
            data = await window.api.dbGetAll('fouilles');
        }
        selectorUpdate(data);
    } catch (err) {
        console.error(err);
    }
};

const selectorUpdate = (data) => {
    const selectAnnee = document.getElementById('annee');
    const selectCategorie = document.getElementById('categorie');
    const selectUnitesStrat = document.getElementById('uniteStrat');

    const yearSelected = document.getElementById('yearSelected').checked;
    const categorieSelected = document.getElementById('categorieSelected').checked;
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked;

    let years = [];
    let categories = [];
    let unitesStrat = [];

    data.forEach(element => {
        let yearExists = false;
        let categorieExists = false;
        let uniteStratExists = false;

        const { date, categorie, us } = element;

        if (date !== null) {
            for (let i = 0; i < years.length; i++) {
                if (date === years[i]) yearExists = true;
            }
            if (!yearExists) years.push(date);
        }

        if (categorie && categorie !== 'Categorie') {
            for (let i = 0; i < categories.length; i++) {
                if (categorie.toLowerCase() === categories[i]) categorieExists = true;
            }
            if (!categorieExists) categories.push(categorie.toLowerCase());
        }

        if (us !== null) {
            for (let i = 0; i < unitesStrat.length; i++) {
                if (us.toString().toLowerCase() === unitesStrat[i]) uniteStratExists = true;
            }
            if (!uniteStratExists) unitesStrat.push(us.toString().toLowerCase());
        }
    });

    years.sort((a, b) => b - a);
    categories.sort();
    unitesStrat.sort();

    // Re-fill only non-locked fields
    if (!yearSelected) {
        selectAnnee.innerHTML = "";
        years.forEach(year => {
            const opt = document.createElement('option');
            opt.value = opt.text = year;
            selectAnnee.appendChild(opt);
        });
    }

    if (!categorieSelected) {
        selectCategorie.innerHTML = "";
        categories.forEach(categorie => {
            const opt = document.createElement('option');
            opt.value = opt.text = categorie;
            selectCategorie.appendChild(opt);
        });
    }

    if (!uniteStratSelected) {
        selectUnitesStrat.innerHTML = "";
        unitesStrat.forEach(uniteStrat => {
            const opt = document.createElement('option');
            opt.value = opt.text = uniteStrat;
            selectUnitesStrat.appendChild(opt);
        });
    }
};

// Switch active panels / tabs
const switchTab = (panelId, tabButton) => {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    document.getElementById(panelId).classList.add('active');
    tabButton.classList.add('active');

    // Trigger tab-specific initialization
    if (panelId === 'map-panel') {
        setTimeout(drawMapInteractive, 50);
    } else if (panelId === 'stats-panel') {
        generateStats();
    }
};

// Map Canvas Setup
const triggerDisplayMap = async () => {
    switchTab('map-panel', document.getElementById('tab-map-panel'));

    const dataResult = await getData();
    if (!dataResult || !dataResult.data) return;

    currentFouillesData = dataResult;
    document.getElementById('dataTitle').innerHTML = dataResult.title || "Plan de Carroyage";

    if (!currentMapData) {
        currentMapData = await window.api.getCarroyageJson();
    }

    if (!mapImage) {
        mapImage = new Image();
        mapImage.onload = () => {
            drawMapInteractive();
            resetZoomAndPan();
        };
        mapImage.src = './assets/img/plan-v2_2019.jpg';
    } else {
        drawMapInteractive();
    }
};

const drawMapInteractive = () => {
    const canvas = document.getElementById('carroyage');
    if (!canvas || !mapImage) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Zoom and pan translation
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    ctx.drawImage(mapImage, 0, 0);

    // Overlay grid and density data
    if (currentMapData && currentFouillesData) {
        const { data, type } = currentFouillesData;
        let zoneData = [];

        data.forEach(element => {
            let exists = false;
            let obj = new Object();
            const { zone, quantite } = element;
            if (zone !== 'Zone') {
                for (let i = 0; i < zoneData.length; i++) {
                    if (zone === zoneData[i].zone) {
                        exists = true;
                        zoneData[i].quantite += quantite;
                    }
                }
                if (exists === false) {
                    obj.zone = zone;
                    obj.quantite = quantite;
                    zoneData.push(obj);
                }
            }
        });

        if (type === 'mono') {
            const zones = zoneData;
            zoneData = [];
            for (let index = 0; index < zones.length; index++) {
                let obj = new Object();
                obj.zone = zones[index].zone;
                obj.quantite = 0;
                zoneData.push(obj);
            }
        }

        drawnCells = [];
        let x = 0;
        let y = 0;
        let xSize = 1.1;
        let ySize = 0.99;

        for (let posY = -50; posY < mapImage.height; posY += 106 * ySize) {
            for (let posX = -50; posX < mapImage.width; posX += 106 * xSize) {
                if (x === 8) {
                    xSize = 1.80;
                } else {
                    xSize = 1.07;
                }

                const zoneName = (currentMapData.carroyage[y] && currentMapData.carroyage[y][x]) ? currentMapData.carroyage[y][x] : ".";
                let activeQuantite = null;

                zoneData.forEach(zd => {
                    if (zd.zone === zoneName) activeQuantite = zd.quantite;
                });

                drawnCells.push({
                    x: posX,
                    y: posY,
                    w: 106 * xSize,
                    h: 106 * ySize,
                    zone: zoneName,
                    quantite: activeQuantite
                });

                // Draw Grid Border
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.strokeRect(posX, posY, 106 * xSize, 106 * ySize);

                if (zoneName !== ".") {
                    // Density color fill
                    if (activeQuantite !== null) {
                        if (activeQuantite === 0) {
                            ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
                        } else if (activeQuantite < 6) {
                            ctx.fillStyle = 'rgba(254, 254, 177, 0.7)';
                        } else if (activeQuantite >= 6 && activeQuantite < 11) {
                            ctx.fillStyle = 'rgba(253, 175, 79, 0.7)';
                        } else if (activeQuantite >= 11 && activeQuantite < 16) {
                            ctx.fillStyle = 'rgba(237, 80, 40, 0.7)';
                        } else if (activeQuantite >= 16) {
                            ctx.fillStyle = 'rgba(100, 23, 14, 0.7)';
                        }
                        ctx.fillRect(posX, posY, 106 * xSize, 106 * ySize);
                    }

                    // Zone tag text
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                    ctx.font = 'bold 22px Outfit, Arial';
                    ctx.fillText(zoneName, posX + 16, posY + 40);
                }
                x++;
            }
            y++;
            x = 0;
        }

        document.getElementById('mapLegend').style.display = 'flex';
    } else {
        document.getElementById('mapLegend').style.display = 'none';
    }

    ctx.restore();
};

// Canvas zoom and pan interactions
const setupCanvasInteraction = () => {
    const canvas = document.getElementById('carroyage');
    if (!canvas) return;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isDragging) {
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            drawMapInteractive();
        } else {
            handleTooltip(mouseX, mouseY);
        }
    });

    canvas.addEventListener('mouseup', () => { isDragging = false; });
    canvas.addEventListener('mouseleave', () => { isDragging = false; hideTooltip(); });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const targetX = (mouseX - panX) / zoom;
        const targetY = (mouseY - panY) / zoom;

        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        zoom = Math.max(0.04, Math.min(4.0, zoom * factor));

        panX = mouseX - targetX * zoom;
        panY = mouseY - targetY * zoom;

        drawMapInteractive();
    });
};

const handleTooltip = (mouseX, mouseY) => {
    const tooltip = document.getElementById('mapTooltip');
    if (!tooltip || drawnCells.length === 0) return;

    const imageX = (mouseX - panX) / zoom;
    const imageY = (mouseY - panY) / zoom;

    const cell = drawnCells.find(c =>
        imageX >= c.x && imageX <= c.x + c.w &&
        imageY >= c.y && imageY <= c.y + c.h
    );

    if (cell && cell.zone !== ".") {
        tooltip.style.display = 'block';
        tooltip.style.left = (mouseX + 16) + 'px';
        tooltip.style.top = (mouseY + 16) + 'px';

        let content = `<strong>Zone : ${cell.zone}</strong>`;
        if (cell.quantite !== null) {
            content += `<br/>Quantité : ${cell.quantite > 0 ? cell.quantite : 'Présence US/Année'}`;
        }
        tooltip.innerHTML = content;
    } else {
        hideTooltip();
    }
};

const hideTooltip = () => {
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) tooltip.style.display = 'none';
};

const adjustZoom = (factor) => {
    const canvas = document.getElementById('carroyage');
    if (!canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const targetX = (centerX - panX) / zoom;
    const targetY = (centerY - panY) / zoom;

    zoom = Math.max(0.04, Math.min(4.0, zoom * factor));
    panX = centerX - targetX * zoom;
    panY = centerY - targetY * zoom;

    drawMapInteractive();
};

const resetZoomAndPan = () => {
    const canvas = document.getElementById('carroyage');
    if (!canvas || !mapImage) return;

    const scaleX = canvas.width / mapImage.width;
    const scaleY = canvas.height / mapImage.height;
    zoom = Math.min(scaleX, scaleY) * 0.95;
    if (zoom <= 0) zoom = 0.12;

    panX = (canvas.width - mapImage.width * zoom) / 2;
    panY = (canvas.height - mapImage.height * zoom) / 2;

    drawMapInteractive();
};

// Database Query helper
const getData = async () => {
    const yearSelected = document.getElementById('yearSelected').checked;
    const categorieSelected = document.getElementById('categorieSelected').checked;
    const uniteStratSelected = document.getElementById('uniteStratSelected').checked;

    let year = null;
    let categorie = null;
    let stratUnit = null;

    if (yearSelected) {
        year = parseInt(document.getElementById('annee').value);
    }
    if (categorieSelected) {
        categorie = document.getElementById('categorie').value;
    }
    if (uniteStratSelected) {
        stratUnit = document.getElementById('uniteStrat').value.toString();
    }

    let data = [];
    let title = "";
    let type = "mono";

    try {
        if (yearSelected && categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie, us: stratUnit });
            title = `Année ${year}, catégorie ${categorie}, US ${stratUnit}`;
            type = 'multi';
        } else if (yearSelected && categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, categorie: categorie });
            title = `Année ${year}, catégorie ${categorie}`;
            type = 'multi';
        } else if (categorieSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie, us: stratUnit });
            title = `Catégorie ${categorie}, US ${stratUnit}`;
            type = 'multi';
        } else if (yearSelected && uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year, us: stratUnit });
            title = `Année ${year}, US ${stratUnit}`;
            type = 'mono';
        } else if (yearSelected) {
            data = await window.api.dbGetRows('fouilles', { date: year });
            title = `Année ${year}`;
            type = 'mono';
        } else if (categorieSelected) {
            data = await window.api.dbGetRows('fouilles', { categorie: categorie });
            title = `Catégorie ${categorie}`;
            type = 'multi';
        } else if (uniteStratSelected) {
            data = await window.api.dbGetRows('fouilles', { us: stratUnit });
            title = `US ${stratUnit}`;
            type = 'mono';
        } else {
            data = await window.api.dbGetAll('fouilles');
            title = "Toutes les fouilles";
            type = 'multi';
        }
    } catch (err) {
        console.error(err);
    }

    return { title, data, type };
};

// Results Table Renders
const displayDataTab = () => {
    displayData();
};

const displayData = async () => {
    const tableDataTitle = document.getElementById('tableDataTitle');
    let zoneData = [];

    switchTab('table-panel', document.getElementById('tab-table-panel'));

    const { data, type, title } = await getData();
    if (!data) return;

    data.forEach(element => {
        let exists = false;
        let obj = new Object();
        const { zone, quantite } = element;

        if (zone !== 'Zone') {
            for (let i = 0; i < zoneData.length; i++) {
                if (zone === zoneData[i].zone) {
                    exists = true;
                    zoneData[i].quantite += quantite;
                }
            }
            if (exists === false) {
                obj.zone = zone;
                obj.quantite = quantite;
                zoneData.push(obj);
            }
        }
    });

    if (type !== "multi") {
        let zones = zoneData;
        zoneData = [];
        for (let index = 0; index < zones.length; index++) {
            let obj = new Object();
            obj.zone = zones[index].zone;
            obj.quantite = 0;
            zoneData.push(obj);
        }
    }
    zoneData.sort();
    tableRowsData = zoneData;

    tableDataTitle.innerHTML = title || "Tableau des Résultats";
    renderTableRows(zoneData);
};

const renderTableRows = (rows) => {
    const dataTable = document.getElementById('dataTable');
    if (!rows || rows.length === 0) {
        dataTable.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 24px;">Aucun résultat correspondant.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = "table";

    const thead = table.createTHead();
    const rowHeader = thead.insertRow(0);
    rowHeader.insertCell(0).innerHTML = "<strong>Zone</strong>";
    rowHeader.insertCell(1).innerHTML = "<strong>Quantité / Statut</strong>";

    const tbody = document.createElement('tbody');
    rows.forEach(element => {
        const { zone, quantite } = element;
        const row = tbody.insertRow();
        row.insertCell(0).textContent = zone;
        row.insertCell(1).textContent = quantite > 0 ? quantite : "Trouvé";
    });
    table.appendChild(tbody);

    dataTable.innerHTML = "";
    dataTable.appendChild(table);
};

const filterTableData = () => {
    const query = document.getElementById('tableSearch').value.toLowerCase();
    if (!query) {
        renderTableRows(tableRowsData);
        return;
    }
    const filtered = tableRowsData.filter(r => r.zone.toLowerCase().includes(query));
    renderTableRows(filtered);
};

// Download canvas utility (High-Resolution A4/A3 Print Quality)
const downloadCanvas = () => {
    if (!mapImage || !currentMapData || !currentFouillesData) {
        alert("Veuillez d'abord projeter des données sur la carte.");
        return;
    }

    // Create high-res offscreen canvas (4218 x 5318 pixels)
    const offscreen = document.createElement('canvas');
    offscreen.width = mapImage.width;
    offscreen.height = mapImage.height;
    const ctx = offscreen.getContext('2d');

    // 1. Draw original high-res background map
    ctx.drawImage(mapImage, 0, 0);

    // 2. Draw Grid & Data at 1:1 scale
    const { data, type } = currentFouillesData;
    let zoneData = [];

    data.forEach(element => {
        let exists = false;
        let obj = new Object();
        const { zone, quantite } = element;
        if (zone !== 'Zone') {
            for (let i = 0; i < zoneData.length; i++) {
                if (zone === zoneData[i].zone) {
                    exists = true;
                    zoneData[i].quantite += quantite;
                }
            }
            if (exists === false) {
                obj.zone = zone;
                obj.quantite = quantite;
                zoneData.push(obj);
            }
        }
    });

    if (type === 'mono') {
        const zones = zoneData;
        zoneData = [];
        for (let index = 0; index < zones.length; index++) {
            let obj = new Object();
            obj.zone = zones[index].zone;
            obj.quantite = 0;
            zoneData.push(obj);
        }
    }

    let x = 0;
    let y = 0;
    let xSize = 1.1;
    let ySize = 0.99;

    for (let posY = -50; posY < mapImage.height; posY += 106 * ySize) {
        for (let posX = -50; posX < mapImage.width; posX += 106 * xSize) {
            if (x === 8) {
                xSize = 1.80;
            } else {
                xSize = 1.07;
            }

            const zoneName = (currentMapData.carroyage[y] && currentMapData.carroyage[y][x]) ? currentMapData.carroyage[y][x] : ".";
            let activeQuantite = null;

            zoneData.forEach(zd => {
                if (zd.zone === zoneName) activeQuantite = zd.quantite;
            });

            // Draw Grid Border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 3; // Thicker border for print legibility
            ctx.strokeRect(posX, posY, 106 * xSize, 106 * ySize);

            if (zoneName !== ".") {
                // Density color fill
                if (activeQuantite !== null) {
                    if (activeQuantite === 0) {
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
                    } else if (activeQuantite < 6) {
                        ctx.fillStyle = 'rgba(254, 254, 177, 0.7)';
                    } else if (activeQuantite >= 6 && activeQuantite < 11) {
                        ctx.fillStyle = 'rgba(253, 175, 79, 0.7)';
                    } else if (activeQuantite >= 11 && activeQuantite < 16) {
                        ctx.fillStyle = 'rgba(237, 80, 40, 0.7)';
                    } else if (activeQuantite >= 16) {
                        ctx.fillStyle = 'rgba(100, 23, 14, 0.7)';
                    }
                    ctx.fillRect(posX, posY, 106 * xSize, 106 * ySize);
                }

                // Zone tag text (use larger font for the original size)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.font = 'bold 36px Outfit, Arial';
                ctx.fillText(zoneName, posX + 20, posY + 65);
            }
            x++;
        }
        y++;
        x = 0;
    }

    // 3. Draw Legend Box onto the image itself for printing (Bottom-Left)
    const legendWidth = 600;
    const legendHeight = 350;
    const legendX = 50;
    const legendY = mapImage.height - legendHeight - 50;

    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 4;

    // Draw rounded rectangle for legend background
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 20);
    } else {
        ctx.rect(legendX, legendY, legendWidth, legendHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Legend Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Outfit, Arial';
    ctx.fillText("Densité d'objets (Légende)", legendX + 35, legendY + 55);

    const drawLegendItem = (color, text, offset) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(legendX + 35, legendY + 85 + offset, 40, 40, 8);
        } else {
            ctx.rect(legendX + 35, legendY + 85 + offset, 40, 40);
        }
        ctx.fill();
        ctx.fillStyle = '#9ca3af';
        ctx.font = '28px Outfit, Arial';
        ctx.fillText(text, legendX + 95, legendY + 115 + offset);
    };

    drawLegendItem('rgba(0, 255, 0, 0.5)', 'Trouvaille unique (mono)', 0);
    drawLegendItem('rgba(254, 254, 177, 0.8)', 'Faible (1 à 5)', 50);
    drawLegendItem('rgba(253, 175, 79, 0.8)', 'Moyenne (6 à 10)', 100);
    drawLegendItem('rgba(237, 80, 40, 0.8)', 'Élevée (11 à 15)', 150);
    drawLegendItem('rgba(100, 23, 14, 0.8)', 'Très élevée (16+)', 200);

    // 4. Draw Title box at the Top-Left corner
    const titleText = currentFouillesData.title || "Plan de Carroyage de Morimond";
    ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
    ctx.lineWidth = 4;

    const titleWidth = ctx.measureText(titleText).width + 80;
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(50, 50, titleWidth, 100, 20);
    } else {
        ctx.rect(50, 50, titleWidth, 100);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Outfit, Arial';
    ctx.fillText(titleText, 90, 112);

    // Export link
    const link = document.querySelector('a#download');
    link.href = offscreen.toDataURL('image/png');
};

// Statistics Dashboard Generator
const generateStats = async () => {
    const dataResult = await getData();
    const data = dataResult.data || [];

    let totalQty = 0;
    const uniqueZones = new Set();
    const uniqueUS = new Set();
    const categoriesMap = {};
    const yearsMap = {};

    data.forEach(item => {
        totalQty += (item.quantite || 0);
        if (item.zone) uniqueZones.add(item.zone);
        if (item.us) uniqueUS.add(item.us);

        if (item.categorie && item.categorie !== "Categorie") {
            const cat = item.categorie.charAt(0).toUpperCase() + item.categorie.slice(1).toLowerCase();
            categoriesMap[cat] = (categoriesMap[cat] || 0) + (item.quantite || 0);
        }
        if (item.date) {
            yearsMap[item.date] = (yearsMap[item.date] || 0) + (item.quantite || 0);
        }
    });

    document.getElementById('stat-total-objects').textContent = totalQty;
    document.getElementById('stat-total-zones').textContent = uniqueZones.size;
    document.getElementById('stat-total-us').textContent = uniqueUS.size;

    // Check if Chart.js is ready
    if (typeof Chart === 'undefined') return;

    if (categoryChartInstance) categoryChartInstance.destroy();
    if (yearChartInstance) yearChartInstance.destroy();

    // Categories Chart (Donut)
    const catLabels = Object.keys(categoriesMap);
    const catValues = Object.values(categoriesMap);
    if (catLabels.length > 0) {
        const ctxCat = document.getElementById('categoryChart').getContext('2d');
        categoryChartInstance = new Chart(ctxCat, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                    data: catValues,
                    backgroundColor: [
                        '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'
                    ],
                    borderWidth: 1,
                    borderColor: '#111827'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#9ca3af', font: { family: 'Outfit', size: 12 } }
                    }
                }
            }
        });
    }

    // Years Chart (Bar)
    const yearLabels = Object.keys(yearsMap).sort();
    const yearValues = yearLabels.map(y => yearsMap[y]);
    if (yearLabels.length > 0) {
        const ctxYear = document.getElementById('yearChart').getContext('2d');
        yearChartInstance = new Chart(ctxYear, {
            type: 'bar',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: 'Objets trouvés',
                    data: yearValues,
                    backgroundColor: '#3b82f6',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { family: 'Outfit' } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af', font: { family: 'Outfit' } } }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};

// Drag and drop setup
const setupDragAndDrop = () => {
    const dataZone = document.getElementById('drop-zone-data');
    const carroyageZone = document.getElementById('drop-zone-carroyage');

    if (!dataZone || !carroyageZone) return;

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    [dataZone, carroyageZone].forEach(zone => {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.remove('dragover'), false);
        });
    });

    dataZone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            const filePath = files[0].path;
            const result = await window.api.selectAndImportData(filePath);
            alert(result.message);
            initApp();
        }
    });

    carroyageZone.addEventListener('drop', async (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            const filePath = files[0].path;
            const result = await window.api.selectAndImportCarroyage(filePath);
            alert(result.message);
            initApp();
        }
    });
};

// File Import triggers
const importDataFile = async () => {
    const result = await window.api.selectAndImportData();
    if (result) {
        alert(result.message);
        initApp();
    }
};

const importCarroyageFile = async () => {
    const result = await window.api.selectAndImportCarroyage();
    if (result) {
        alert(result.message);
        initApp();
    }
};