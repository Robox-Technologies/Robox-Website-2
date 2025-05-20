//Stages of flashing 
// 1. Detecting if in bootsel
// 1-A. If not then put them in bootsel (either via instructions or automatic)
// 2. Choosing the UF2 (gonna be latest for now)
// 3. Actually flashing the pico
import { pico } from "../communication/communicate";

async function enteringBootsel() {
    let bootselMode = await detectBOOTSEL()
    if (!bootselMode) {
        //We are not in bootsel mode
        pico.bootsel() //Try and set it to bootsel mode
        setTimeout(async () => { //Set out a 1s delay to firmware check
            if (await detectBOOTSEL()) { //we are in bootsel mode

            }
            else { //The pico is not flashed with any firmware and is not responding to stuff
                manualBootsel()
            }
        }, 1000)
    }
    else { //we are in bootsel mode!
        
    }
}
//Display instructions for someone manually entering bootsel
async function manualBootsel() {
    if (await detectBOOTSEL()) {
        //We are in bootsel mode!
    }
}
//Show a dropdown for choose the UF2
async function chooseUF2() {
    
}
async function flashUF2(UF2: ArrayBuffer) {
    const dirHandle = await window.showDirectoryPicker();

    if (!dirHandle.name.includes("RPI-RP2")) {
        alert("Please select the RPI-RP2 drive!");
        return;
    }
    const fileHandle = await dirHandle.getFileHandle("robox.uf2", { create: true });
    const writable = await fileHandle.createWritable();

    await writable.write(this);
    await writable.close();
    alert("UF2 file successfully written! The Pico should reboot now.");
}

async function detectBOOTSEL() {
    let devices = await navigator.usb.getDevices()
    if (devices.length === 0) return false
    for (const device of devices) {
        if (device.productName === "RP2 Boot") { //Pico is in bootsel mode
            return true
        }
    }
    return false;
}