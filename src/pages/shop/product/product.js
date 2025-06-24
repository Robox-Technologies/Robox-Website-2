import { addCartItem, refreshCart } from "@root/payment.ts"


const productId = currentProduct["item_id"]


const carouselImageContainer = document.getElementById("image-carousel")
const carouselImages = document.querySelectorAll(".carousel-image")
const heroImages = document.querySelectorAll(".hero-image")



const rightCarouselButton = document.getElementById("carousel-right-button")
const leftCarouselButton = document.getElementById("carousel-left-button")

rightCarouselButton.addEventListener("click", (e) => {
    if (rightCarouselButton.classList.contains("carousel-button-disabled")) return
    changeHeroImage(currentIndex+1, true)
})
leftCarouselButton.addEventListener("click", (e) => {
    if (leftCarouselButton.classList.contains("carousel-button-disabled")) return
    changeHeroImage(currentIndex-1, true)
})
let quantity = 1

const cartQuantityInput = document.querySelector(".cart-quantity");
const increaseQuantityButton = document.querySelector(".increase-cart-button");
const decreaseQuantityButton = document.querySelector(".decrease-cart-button");

increaseQuantityButton.addEventListener("click", (e) =>{
    updateInputQuantity(quantity+1)
})
decreaseQuantityButton.addEventListener("click", (e) => {
    updateInputQuantity(quantity-1)
})
cartQuantityInput.addEventListener("input", (e) => {
    quantity = Number(cartQuantityInput.value)
})

function updateInputQuantity(amount) {
    if (amount < 1) return;
    cartQuantityInput.value = amount
    quantity = Number(cartQuantityInput.value)
    refreshCart()
}

const addToCartButton = document.getElementById("add-to-cart") 
addToCartButton.addEventListener("click", (e) => {
    //TODO: add toast
    addCartItem(productId, quantity, currentProduct)
    refreshCart()
})
document.addEventListener("DOMContentLoaded", (event) => {
    for (const carouselImage of carouselImages) {
        carouselImage.addEventListener("click", (e) => {
            let divElement = e.target.closest("div")
            changeHeroImage(Array.prototype.indexOf.call(divElement.parentNode.children, divElement))
        })
    }
});

let currentIndex = 0

function changeHeroImage(number, autoscroll) {
    if (number === 0) {
        leftCarouselButton.classList.add("carousel-button-disabled")
    } else if (leftCarouselButton.classList.contains("carousel-button-disabled")) {
        leftCarouselButton.classList.remove("carousel-button-disabled")
    }

    if (number === carouselImages.length-1) {
        rightCarouselButton.classList.add("carousel-button-disabled")
    } else if (rightCarouselButton.classList.contains("carousel-button-disabled")) {
        rightCarouselButton.classList.remove("carousel-button-disabled")
    }

    let carouselThumb = carouselImages[currentIndex];
    carouselThumb.querySelector("img").classList.remove("selected-carousel")

    document.querySelector(".active")?.classList.remove("active")
    const heroImage = heroImages[number]
    heroImage.classList.add("active")
    carouselImages[number].querySelector("img").classList.add("selected-carousel")
    currentIndex = number

    // Scroll if out of bounds
    if (autoscroll) {
        let thumbTop = carouselThumb.offsetTop - carouselThumb.clientHeight*2 - 15;
        let thumbBottom = carouselThumb.offsetTop + carouselThumb.clientHeight;
    
        if (thumbTop < carouselImageContainer.scrollTop) {
            carouselImageContainer.scrollTo({
                top: thumbTop,
                behavior: "smooth",
            });
        } else if (thumbBottom > carouselImageContainer.clientHeight + carouselImageContainer.scrollTop) {
            carouselImageContainer.scrollTo({
                top: thumbBottom - carouselImageContainer.clientHeight,
                behavior: "smooth",
            });
        }
    }
}

const modals = document.querySelectorAll("dialog")
for (const modal of modals) {
    modal.addEventListener("click", (event) => {
        let rect = event.target.getBoundingClientRect();
        if (rect.left > event.clientX ||
            rect.right < event.clientX ||
            rect.top > event.clientY ||
            rect.bottom < event.clientY) {
            modal.close();
        }
    })
}