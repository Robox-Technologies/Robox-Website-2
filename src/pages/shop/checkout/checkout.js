
import { getCart } from "@root/payment.ts";
import {loadStripe} from '@stripe/stripe-js';





const cart = getCart()
const products = cart["products"]
let totalCost = 0
for (const productId in products) {
    let product = products[productId]["data"]
    let cost = products[productId]["quantity"] * product["price"]
    totalCost += cost
}
totalCost *= 100

const appearance = {
    theme: "flat",
    variables: {
        spacingUnit: '4px',

    }
}
const stripePromise = loadStripe('pk_test_51PhrZEKQ7f0SWVUxH1XgKKNh9FCSnLZpAre95yUs2ip95ktaarscGhTfiw4JQVTyCLrsCaW0xTeXIwcVbOUHFDba00b6ZWj5AT');
const clientSecretPromise = getPaymentIntent()
const paymentPromises = Promise.all([stripePromise, clientSecretPromise])

paymentPromises.then((values) => {
    const [stripe, clientSecret] = values
    const options = {
        clientSecret: clientSecret,
        appearance: appearance
    };
    const elements = stripe.elements(options)
    const addressElement = elements.create('address', {mode: "shipping"});
    addressElement.mount('#address-element');
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    paymentElement.on("loaderstart", (event) => {
        document.getElementById("spinner").style.display = "none"
        document.getElementById("email").style.display = "block"
        document.getElementById("email-label").style.display = "block"
        document.getElementById("stripe-content").style.justifyContent = "flex-start"
    })
    const form = document.getElementById('payment-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const {error} = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: '/',
                receipt_email: email,
            },
        });

        if (error) {
            const messageContainer = document.querySelector('#error-message');
            messageContainer.textContent = error.message;
        } 
    });
})





getItemData().then(serverProducts => {
    let reload = false
    for (const serverProductId in serverProducts) {
        if (JSON.stringify(serverProducts[serverProductId]) !== JSON.stringify(products[serverProductId]["data"])) {
            reload = true
            addCartItem(serverProductId, 0, serverProducts[serverProductId])
        }
    }
    if (reload) window.location.reload()
})








const orderValueLabel = document.querySelector("#order-value-label")
const orderValue = document.querySelector("#order-value-value")
const itemisedList = document.querySelector("#itemised-list")
const totalValue = document.querySelector("#total-value")

const shippingCost = 10

//Calc is short for calculator chat
function renderCart() {

    orderValueLabel.textContent = `Total ${cart["quantity"]} items:`
    
    let cost = 0
    itemisedList.replaceChildren();
    let productItemisationNode = document.createElement("li")
    productItemisationNode.appendChild(document.createElement("p"))
    productItemisationNode.appendChild(document.createElement("p"))
    for (const productId in products) {
        let product = products[productId]["data"]
        if (!product) continue;
        let price = product.price
        let quantity = products[productId]["quantity"]
        let cloneProductNode = productItemisationNode.cloneNode(true)
        cloneProductNode.firstChild.textContent = `${quantity} x ${product["name"].toUpperCase()}`
        cloneProductNode.lastChild.textContent = `$${price*quantity}`
        if (quantity === 0) {
            continue;
        }
        itemisedList.appendChild(cloneProductNode)
        cost += price*quantity
    }
    orderValue.textContent = `$${cost}`
    totalValue.textContent = `$${cost+shippingCost}`
}
renderCart()


  

async function getPaymentIntent() {
    try {
        const clientSecret = await fetch("/api/store/create", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                products: products,
                expected_price: totalCost
            })
        });
        return (await clientSecret.json()).client_secret;
    }
    catch(err) {
        //do something with the error
        console.log(err)
    }
   
}
async function getItemData() {
    const promises = Object.keys(products).map((productId) =>
        fetch(`${window.location.origin}/api/store/products?id=${productId}`).then(async (response) => [productId, await response.json()])
    );

    const data = await Promise.all(promises);
    return Object.fromEntries(data)
}



