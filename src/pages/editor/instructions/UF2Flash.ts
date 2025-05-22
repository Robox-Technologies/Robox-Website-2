//Stages of flashing 
// 1. Detecting if in bootsel
// 1-A. If not then put them in bootsel (either via instructions or automatic)
// 2. Choosing the UF2 (gonna be latest for now)
// 3. Actually flashing the pico
import { pico } from "../communication/communicate";
document.addEventListener("DOMContentLoaded", () => {
    let stage1 = document.querySelector("dialog#bootsel-boot-modal") as HTMLDialogElement | null
    if (!stage1) return
    stage1.showModal()
    let autoBootselButton = document.querySelector("button#bootsel-boot-confirm") as HTMLButtonElement | null
    if (!autoBootselButton) return
   
    
    autoBootselButton.addEventListener("click", () => {
        let bootselSpin = document.querySelector("#bootsel-loading") as HTMLElement | null
        if (!bootselSpin) return
        autoBootselButton.style.display = "none"
        bootselSpin.style.display = "block"
        pico.bootsel()
        setTimeout(async () => { //Set out a 1s delay to firmware check
            let outcomeText = document.getElementById("bootsel-outcom-text")
            if (!outcomeText) return
            bootselSpin.style.display = "none"        
            if (await detectBOOTSEL()) { //we are in bootsel mode
                outcomeText.textContent = "Success! Your RO\\BOX is in BOOTSEL mode! Click the 'next' button to move to the next step"
            }
            else { //The pico is not flashed with any firmware and is not responding to stuff
                outcomeText.textContent = "Unfortunately that did not work! Please follow the following instructions to manually boot your RO\\BOX into BOOTSEL mode"
                autoBootselButton.textContent = "Recheck"
                autoBootselButton.style.display = "inline-block"
                manualBootsel(autoBootselButton, outcomeText)
            }
        }, 1000)
    })
})
async function manualBootsel(retryButton: HTMLButtonElement, outcomeText: HTMLElement) {
    retryButton.addEventListener("click", async () => {
        if (await detectBOOTSEL() || true) {
            outcomeText.textContent = "Success! Your RO\\BOX is in BOOTSEL mode! Click the 'next' button to move to the next step"
        }
        else {
            //Gotta display something for when we cannot detect the manual BOOTSEL
        }
    })
    
}


async function flashUF2(UF2: ArrayBuffer) {
    let nextButton = document.getElementById("#next-bootsel-button")
    nextButton?.addEventListener("click", async () => {
        const dirHandle = await window.showDirectoryPicker();

        if (!dirHandle.name.includes("RPI-RP2")) {
            alert("Please select the RPI-RP2 drive!");
            return;
        }
        const fileHandle = await dirHandle.getFileHandle("robox.uf2", { create: true });
        const writable = await fileHandle.createWritable();

        await writable.write(UF2);
        await writable.close();
        alert("UF2 file successfully written! The Pico should reboot now.");
    })
    
}

//Show a dropdown for choose the UF2
async function chooseUF2() {
    
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