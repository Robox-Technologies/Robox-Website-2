document.addEventListener("click", (event: MouseEvent) => {
    let item = event.target as HTMLElement | null
    let toolbar = document.querySelector(".toolbar") as HTMLDialogElement | null
    if (item && toolbar && toolbar.hasAttribute("open")) {
        toolbar.close()
    }
})