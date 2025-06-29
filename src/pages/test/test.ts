document.addEventListener("DOMContentLoaded", () => {
    const infobox: HTMLElement | null = document.querySelector(".infobox");
    const selectElem: HTMLSelectElement | null = document.querySelector("select");

    selectElem?.addEventListener("change", () => {
        const area = selectElem.value;

        // Set the position-area to the value chosen in the select box
        if (!infobox) return
        infobox.style.positionArea = area;
    });
}) 

