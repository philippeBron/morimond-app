// Browser-side database connector (IndexedDB + SheetJS) for static web hosting (GitHub Pages)
const DB_NAME = 'morimond_db';
const DB_VERSION = 1;

let dbInstance = null;

// Initialize IndexedDB
const getDb = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('fouilles')) {
                db.createObjectStore('fouilles', { autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('carroyage')) {
                db.createObjectStore('carroyage', { autoIncrement: true });
            }
        };

        request.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };

        request.onerror = (e) => {
            console.error('IndexedDB open error:', e);
            reject(e);
        };
    });
};

// Database utilities
const dbGetAllWeb = async (storeName) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const dbGetRowsWeb = async (storeName, query) => {
    const all = await dbGetAllWeb(storeName);
    // Filter matching query keys
    return all.filter(item => {
        for (const key in query) {
            if (query[key] !== null && query[key] !== undefined) {
                // Perform loose case-insensitive matching if string
                if (typeof query[key] === 'string' && typeof item[key] === 'string') {
                    if (item[key].toLowerCase() !== query[key].toLowerCase()) return false;
                } else {
                    if (item[key] != query[key]) return false;
                }
            }
        }
        return true;
    });
};

const dbClearAndInsertWeb = async (storeName, items) => {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        
        store.clear(); // Clear old database content
        items.forEach(item => {
            store.add(item);
        });

        transaction.oncomplete = () => resolve({ success: true });
        transaction.onerror = () => reject(transaction.error);
    });
};

// Excel Date Converter
const excelDateToJSDateWeb = (serial) => {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;                                        
    var date_info = new Date(utc_value * 1000);
    var fractional_day = serial - Math.floor(serial) + 0.0000001;
    var total_seconds = Math.floor(86400 * fractional_day);
    var seconds = total_seconds % 60;
    total_seconds -= seconds;
    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;
    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
};

// Pre-load default JSON files from repository if database is empty
const checkAndPreloadData = async () => {
    try {
        const existingData = await dbGetAllWeb('fouilles');
        if (existingData && existingData.length > 0) {
            // Already initialized
            return;
        }

        console.log('IndexedDB is empty, pre-loading default JSON data...');
        
        // Fetch fouilles.json
        const resFouilles = await fetch('fouilles.json');
        if (resFouilles.ok) {
            const defaultFouilles = await resFouilles.json();
            if (defaultFouilles && defaultFouilles.length > 0) {
                await dbClearAndInsertWeb('fouilles', defaultFouilles);
                console.log('Preloaded default fouilles.json successfully.');
            }
        }

        // Fetch carroyage.json
        const resCarroyage = await fetch('carroyage.json');
        if (resCarroyage.ok) {
            const defaultCarroyage = await resCarroyage.json();
            if (defaultCarroyage) {
                await dbClearAndInsertWeb('carroyage', [defaultCarroyage]);
                console.log('Preloaded default carroyage.json successfully.');
            }
        }

        // Reload app data
        if (window.initApp) {
            window.initApp();
        }
    } catch (err) {
        console.error('Failed to pre-load default data:', err);
    }
};

// Excel Reading Helper using SheetJS
const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                resolve(rows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};

// API exposing
window.webApi = {
    dbGetAll: (table) => dbGetAllWeb(table),
    dbGetRows: (table, query) => dbGetRowsWeb(table, query),
    getCarroyageJson: async () => {
        const items = await dbGetAllWeb('carroyage');
        return items.length > 0 ? items[0] : null;
    },
    
    // Direct Excel imports from File object (passed from Drag & Drop or file dialogs)
    selectAndImportData: async (file) => {
        if (!file) return { success: false, message: 'Aucun fichier fourni' };
        try {
            const rows = await parseExcelFile(file);
            const items = [];
            
            // Format rows similar to main.js
            for (let i = 0; i < rows.length; i++) {
                const element = rows[i];
                if (!element || element.length === 0) continue;

                // Skip Excel header row if it contains headers
                if (i === 0 && element[0] === 'Zone') continue;

                let obj = new Object();
                obj.zone = element[0];
                obj.categorie = element[1];
                obj.sousCategorie = element[2];
                obj.quantite = typeof element[3] === 'number' ? element[3] : 0;
                obj.complement = element[4];
                obj.us = element[5] !== null && element[5] !== undefined ? element[5].toString() : null;

                if (element[6] !== null && element[6] !== undefined) {
                    if (typeof element[6] === 'number') {
                        obj.date = excelDateToJSDateWeb(element[6]).getFullYear();
                    } else if (element[6] instanceof Date) {
                        obj.date = element[6].getFullYear();
                    } else {
                        // try direct parse
                        const parsedYear = parseInt(element[6]);
                        obj.date = !isNaN(parsedYear) ? parsedYear : null;
                    }
                } else {
                    obj.date = null;
                }

                items.push(obj);
            }

            await dbClearAndInsertWeb('fouilles', items);
            return { success: true, message: 'Données de fouilles chargées avec succès dans le navigateur !' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erreur lors du chargement : ' + err.message };
        }
    },

    selectAndImportCarroyage: async (file) => {
        if (!file) return { success: false, message: 'Aucun fichier fourni' };
        try {
            const rows = await parseExcelFile(file);
            const grid = [];
            
            rows.forEach(element => {
                let tab = [];
                for (let index = 0; index < 40; index++) {
                    tab.push(element[index] !== undefined ? element[index] : ".");
                }
                grid.push(tab);
            });

            const carroyageObj = {
                carroyage: grid
            };

            await dbClearAndInsertWeb('carroyage', [carroyageObj]);
            return { success: true, message: 'Carroyage chargé avec succès dans le navigateur !' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Erreur lors du chargement : ' + err.message };
        }
    }
};

// Check for default data pre-loads on startup
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAndPreloadData, 500);
});
