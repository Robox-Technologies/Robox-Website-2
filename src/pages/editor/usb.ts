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
const ws = Blockly.getMainWorkspace()


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
            connectionManagment.setAttribute("loading",  "false")
        }
    })
    pico.addEventListener("connect", (event) => {
        connectionManagment.setAttribute("status",  "connected")
        connectionManagment.setAttribute("loading",  "false")
    })
    pico.addEventListener("download", (event) => {
        connectionManagment.setAttribute("status",  "downloaded")
        connectionManagment.setAttribute("loading",  "false")

    })

    connectButton?.addEventListener("click", () => {
        pico.request()
        connectionManagment.setAttribute("loading",  "true")
    });
    downloadButton?.addEventListener("click", () => {
        let code = pythonGenerator.workspaceToCode(ws);
        let finalCode = `${scriptDependency}\n${code}\nevent_begin()`
        pico.sendCode(finalCode)
        connectionManagment.setAttribute("loading",  "true")

    })
    stopButton?.addEventListener("click", () => {
        pico.restart()
        connectionManagment.setAttribute("loading",  "true")
    })
    runButton?.addEventListener("click", () => {
        pico.runCode()
        connectionManagment.setAttribute("status",  "running")
        connectionManagment.setAttribute("loading",  "false")

    })
})

