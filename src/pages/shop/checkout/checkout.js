import { getCart } from "@root/payment.ts";
import {loadStripe} from '@stripe/stripe-js';
import "@root/shop.ts";




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

    if (!clientSecret) {
        checkoutErrored();
        return;
    }

    const options = {
        clientSecret: clientSecret,
        appearance: appearance
    };
    const elements = stripe.elements(options)
    const addressElement = elements.create('address', {
        mode: "shipping",
        allowedCountries: ['AU']
    });
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
                return_url: `${window.location.origin}/shop/checkout/confirmation`,
                receipt_email: email,
            },
        });

        if (error) {
            const messageContainer = document.querySelector('#error-message');
            messageContainer.textContent = error.message;
        } 
    });
}).catch((error) => {
    console.warn(error);
    checkoutErrored();
});
  

async function getPaymentIntent() {
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

function checkoutErrored() {
    // Error fetching secret. Handle and show appropriate error
    document.getElementById("checkout-error").style.display = "block";
    document.getElementById("payment-form").style.display = "none";
}
