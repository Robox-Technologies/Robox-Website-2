document.addEventListener("DOMContentLoaded", () => {
    const modals:NodeListOf<HTMLDialogElement> = document.querySelectorAll("dialog.modal")
    for (const modal of modals) {
        
        modal.addEventListener("click", (event: MouseEvent) => {
            let element = event?.target as HTMLElement | null
            if (!element) return
            let rect = modal.getBoundingClientRect();
            if (rect.left > event.clientX ||
                rect.right < event.clientX ||
                rect.top > event.clientY ||
                rect.bottom < event.clientY
            ) {
                modal.close();
            }
            event.stopPropagation()
        })
        let cancelButton: HTMLElement | null = modal.querySelector(".close-modal-button")
        if (!cancelButton) return
        cancelButton.addEventListener("click", (event) => {
            modal.close()
            event.stopPropagation()
        })
    }
})