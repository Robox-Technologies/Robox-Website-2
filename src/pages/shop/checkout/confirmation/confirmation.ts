import { wipeCart, stripePublishableKey } from "@root/cart";
import { loadStripe } from '@stripe/stripe-js';

const urlParams = new URLSearchParams(window.location.search);
const paymentIntentClientSecret = urlParams.get("payment_intent_client_secret");

const stripe = await loadStripe(stripePublishableKey);

async function pollIntent(): Promise<string> {
    let paymentIntentResult = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
    let paymentIntent = paymentIntentResult.paymentIntent;

    if (!paymentIntent || paymentIntent.status === "processing") return "retry";
    
    document.getElementById("loading").style.display = "none";

    if (paymentIntent.status === "succeeded") {
        document.getElementById("failure").style.display = "none";
        document.getElementById("success").style.display = "block";
        document.getElementById("email").textContent = paymentIntent.receipt_email;
        wipeCart();
    } else {
        document.getElementById("failure").style.display = "block";
        document.getElementById("success").style.display = "none";
    }
}

let result = "retry";

while (result === "retry") {
    result = await pollIntent();
}