import { pico } from './communication/communicate';


document.addEventListener("DOMContentLoaded", (event) => {
    const connectionManagment = document.getElementById("connection-managment")

    const connectButton = document.getElementById("connect-robox-button")
    const downloadButton = document.getElementById("download-robox-button")
    const stopButton = document.getElementById("stop-robox-button")
    const runButton = document.getElementById("run-robox-button")

    if (!connectionManagment) return
    

    pico.addEventListener("disconnect", (event) => {
        const picoEvent = event as CustomEvent
        if (!picoEvent.detail.restarting) { //Disconnected
            connectionManagment.setAttribute("status",  "disconnected")
        }
    })
    pico.addEventListener("connect", (event) => {
        connectionManagment.setAttribute("status",  "connected")
    })
    connectButton?.addEventListener("click", () => pico.request());
})

