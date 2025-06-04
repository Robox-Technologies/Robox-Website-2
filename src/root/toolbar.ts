document.addEventListener("click", (event: MouseEvent) => {
    let item = event.target as HTMLElement | null
    let toolbar = document.querySelector(".toolbar") as HTMLDialogElement | null
    if (!toolbar) return
    if (!item) return
    let rect = toolbar.getBoundingClientRect();
    if (rect.left > event.clientX ||
        rect.right < event.clientX ||
        rect.top > event.clientY ||
        rect.bottom < event.clientY
    ) {
        toolbar.close();
    }
})