document.addEventListener("DOMContentLoaded", () => {
    let calibrateModal = document.getElementById("color-calibration-modal") as HTMLDialogElement | null
    if (!calibrateModal) return
    calibrateModal.showModal()
})