const electron = require('electron')
const { ipcRenderer } = electron

const form = document.querySelector('form')
form.addEventListener('submit', submitForm())

function submitForm(e) {
    e.preventDefeult()
    console.log('test');
}