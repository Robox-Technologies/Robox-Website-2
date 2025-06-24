import { getCart, refreshCart, setCartItem, getItem, removeCartItem} from "@root/payment.ts"
import { renderCart } from "@root/shop.ts"

const availableHolder = document.querySelector("#available-section")
const preorderHolder = document.querySelector("#preorder-section")

const cartItemElement = document.querySelector("#cart-item")

function renderItemSubtotal(itemId) {
    let products = getCart()["products"];
    let subtotalElement = document.getElementById(itemId).querySelector(".cart-item-text-subtotal");

    if (!subtotalElement) return;

    if (!(itemId in products)) {
        subtotalElement.textContent = "$0";
        return;
    }

    let updatedProduct = products[itemId];
    let updatedProductData = updatedProduct["data"];
    let updatedQuantity = updatedProduct["quantity"]

    subtotalElement.textContent = `$${updatedProductData.price * updatedQuantity}`;
}

function renderPreview() {
    document.querySelectorAll(".cart-item-holder").forEach((e) => e.replaceChildren());
    let products = getCart()["products"]
    let cartEmpty = true;

    for (const productId in products) {
        const product = products[productId]["data"]
        if (!product || productId == "") continue
    
        let price = product["price"]
        let name = product["name"]
        let image = product["images"][0]
        let status = product["status"]
        let quantity = products[productId]["quantity"]
        if (Number(quantity) === 0) {
            removeCartItem(productId)
            continue
        }
    
        let clone = cartItemElement.content.cloneNode(true)
        let titleElement = clone.querySelector(".cart-item-text-title")
        let priceElement = clone.querySelector(".cart-item-text-price")
        let quantityInput = clone.querySelector(".cart-quantity")
        let imageElement = clone.querySelector(".cart-item-photo")
        
        imageElement.src = image
        
        titleElement.textContent = name
        priceElement.textContent = `$${price}/each`
        
        quantityInput.value = Number(quantity)
    
        let productElement = clone.querySelector(".cart-item")
        productElement.id = product["item_id"]
        productElement.setAttribute("price-id", product["price_id"])

        if (status === "available") {
            availableHolder.querySelector(".cart-item-holder").appendChild(clone)
        } else {
            preorderHolder.querySelector(".cart-item-holder").appendChild(clone)
        }

        renderItemSubtotal(product["item_id"]);
        cartEmpty = false;
    }

    if (cartEmpty) {
        document.getElementById("empty-cart").style.display = "flex";
        document.getElementById("main-content").style.display = "none";
    }
}
renderPreview()

const quantityButtons = document.querySelectorAll(".cart-quantity-button")
for (const quantityButton of quantityButtons) {
    let increaseButton = quantityButton.querySelector(".increase-cart-button")
    let decreaseButton = quantityButton.querySelector(".decrease-cart-button")
    let productId = quantityButton.closest(".cart-item").id
    let quantityElement = quantityButton.querySelector(".cart-quantity")
    quantityElement.addEventListener("input", (e) => {
        updateCart(productId, Number(quantityElement.value))
    })
    increaseButton.addEventListener("click", (e) => {
        updateCart(productId, Number(quantityElement.value)+1)
    })
    decreaseButton.addEventListener("click", (e) => {
        if (Number(quantityElement.value)-1 < 0) return
        updateCart(productId, Number(quantityElement.value)-1)
    })
}
const deleteButtons = document.querySelectorAll(".cart-item-delete")
for (const deleteButton of deleteButtons) {
    let productId = deleteButton.closest(".cart-item").id
    deleteButton.addEventListener("click", (event) => {
        removeCartItem(productId)
        renderCart()
        renderPreview()
    })
}
function updateCart(product, quantity) {
    if (quantity > 100000000) return
    let productElement = document.getElementById(product)
    let quantityInput = productElement.querySelector(".cart-quantity")
    let products = getCart()["products"]
    quantityInput.value = Number(quantity)
    setCartItem(product, Number(quantity), products[product]["data"])
    renderCart()
    renderItemSubtotal(product);
}