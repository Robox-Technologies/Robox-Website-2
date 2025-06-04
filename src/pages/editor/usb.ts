import { pico } from './communication/communicate';
import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python'

const scriptDependency = `
from roboxlib import Motors, LineSensors, UltrasonicSensor
from machine import Pin, Timer
import time
import json
ENV_LED = Pin(25, Pin.OUT)
line = LineSensors()
left_motor_polarity = right_motor_polarity = -1
ultrasonic = UltrasonicSensor()
def generatePrint(typ, message):
    jsmessage = {"type": typ, "message": message}
    return json.dumps(jsmessage)
motors = Motors()
motor_speed = 60
`

let alreadyDownloaded = false
let downloadingToPico = false


export function postBlocklyWSInjection() {
    const ws = Blockly.getMainWorkspace()
    const connectionManagment = document.getElementById("connection-managment")

    const connectButton = document.getElementById("connect-robox-button")
    const downloadButton = document.getElementById("download-robox-button")
    const downloadConnectionButton = document.getElementById("download")
    const stopButton = document.getElementById("stop-robox-button")
    const runButton = document.getElementById("run-robox-button")

    if (!connectionManagment) return
    

    pico.addEventListener("disconnect", (event) => {
        const picoEvent = event as CustomEvent
        if (!picoEvent.detail.restarting) { //Disconnected
            connectionManagment.setAttribute("status",  "disconnected")
            connectionManagment.setAttribute("loading",  "false")
        }
    })
    pico.addEventListener("connect", (event) => {
        connectionManagment.setAttribute("status",  "downloaded")
        connectionManagment.setAttribute("loading",  "false")
    })
    pico.addEventListener("download", (event) => {
            connectionManagment.setAttribute("loading",  "false")

        if (downloadingToPico) {
            connectionManagment.setAttribute("status",  "downloaded")
        }
        pico.runCode()
        

    })
    pico.addEventListener("error", (event) => {
        connectionManagment.setAttribute("loading",  "false")
    })
    ws.addChangeListener((event) => {
        if (event.isUiEvent ) return; //Checking if this update changed the blocks
        if (connectionManagment.getAttribute("status") === "downloaded") connectionManagment.setAttribute("status",  "connected") //If they are waiting to run the program then go back to download
        alreadyDownloaded = false //Saying that this workspace has changed
    });
    connectButton?.addEventListener("click", () => {
        if (connectionManagment.getAttribute("loading") === "true") return
        pico.request()
        connectionManagment.setAttribute("loading",  "true")
    });
    downloadButton?.addEventListener("click", () => {
        if (connectionManagment.getAttribute("loading") === "true") return
        sendCode(ws)
        alreadyDownloaded = true
        connectionManagment.setAttribute("loading",  "true")

    })
    downloadConnectionButton?.addEventListener("click", () => {
        downloadingToPico = true
        sendCode(ws)
    })
    stopButton?.addEventListener("click", () => {
        if (connectionManagment.getAttribute("loading") === "true") return
        pico.restart()
        connectionManagment.setAttribute("loading",  "true")
    })
    runButton?.addEventListener("click", () => {
        if (connectionManagment.getAttribute("loading") === "true") return
        connectionManagment.setAttribute("status",  "running")
        connectionManagment.setAttribute("loading",  "false")
    })
    pico.startupConnect()

}
function sendCode(ws: Blockly.Workspace) {
    let code = pythonGenerator.workspaceToCode(ws);
    let finalCode = `${scriptDependency}\n${code}\nevent_begin()`
    pico.sendCode(finalCode)
}