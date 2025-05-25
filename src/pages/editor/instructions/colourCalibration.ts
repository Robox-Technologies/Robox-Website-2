import { pico } from "../communication/communicate"
let calibrated = false
document.addEventListener("DOMContentLoaded", () => {
    let calibrateModal = document.getElementById("color-calibration-modal") as HTMLDialogElement | null
    if (!calibrateModal) return
    let calibrateOutcomeModal = document.getElementById("calibrate-outcome-button") as HTMLDialogElement | null
    if (!calibrateOutcomeModal) return
    calibrateModal.showModal()
    let calibrateButton = document.getElementById("calibrate-button") as HTMLButtonElement | null
    if (!calibrateButton) return
    calibrateButton.addEventListener("click", calibrate)

    pico.addEventListener("calibrated", () => {
        calibrated = true //Successful calibration!
        calibrateModal.close()
        let outcomeText = calibrateOutcomeModal.querySelector(".modal-content p") as HTMLParagraphElement | null
        if (!outcomeText) return
        let outcomeButton = calibrateOutcomeModal.querySelector("#calibrate-outcome-button") as HTMLButtonElement | null
        if (!outcomeButton) return
        outcomeText.textContent = "Calibration was a success!\nThe calibration settings have been saved to the Ro/Box's Pico."
        outcomeButton.textContent = "Done"
    })
})
function calibrate() {
    pico.calibrate()
    setTimeout(() => {
        if (!calibrated) { // Failed for calibrate

        }
    }, 1000)
}
