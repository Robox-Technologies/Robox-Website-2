import cache from 'memory-cache'

// Idk how else to fix this (issue is that stripe.js is not recognised as a module)
// @ts-ignore
import { getProduct, getProductList, stripeAPI } from './stripe.js';


import express from 'express'
import { Request, Response } from 'express';
import { StripeSuperProduct } from './types/stripe';
const paymentRouter = express.Router()

const PRODUCT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const verifiedProducts = await getProductList()


// paymentRouter.use(express.static('./dist'))

paymentRouter.post("/create", async (req: Request, res: Response): Promise<void> => {
    let products = req.body.products
    let expected_price = req.body.expected_price
    if (!products) {
        res.status(400).send({ error: "Products is not defined" });
        return 
    }
    let verifiedServerCost = 0
    for (const productId in products) {
        if (productId === "quantity") continue

        let product = verifiedProducts.filter((product: StripeSuperProduct) => product["item_id"] === productId)[0]
        let quantity = products[productId]["quantity"]
        if (!product) {
            res.status(400).send({
                error: "Product sent does not exist"
            })
            return 
        }
        let itemCost = product["price"] * quantity
        verifiedServerCost += itemCost
    }
    verifiedServerCost *= 100
    if (expected_price !== verifiedServerCost) {
        res.status(400).send({
            error: "Server prices do not match the client prices"    
        })
        return 
    }
    try {
        Object.keys(products).map((productId) => {
            products[productId] = products[productId]["quantity"]
        })
        const paymentIntent = await stripeAPI.paymentIntents.create({
            amount: verifiedServerCost,
            currency: 'aud',
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                products: JSON.stringify(products),
            }
        });
        res.json({client_secret: paymentIntent.client_secret});
    }
    catch (err) {
        console.log(err)
        res.status(500).send({error: err})
    }
})

paymentRouter.get("/products", async (req: Request, res: Response): Promise<void> => {
    if (req.query["id"]) {
        let productId = req.query["id"]
        if (productId === "quantity") {
            res.status(200).send(false)
            return 
        }
        let cachedProduct = cache.get(productId)
        if (cachedProduct) {
            res.send(cachedProduct)
            return 
        }
        if (typeof productId !== "string") {
            res.status(400);
            return
        }
        let product = await getProduct(productId)
        if (!product) {
            res.status(400);
            return 
        }
        cache.put(productId, product, PRODUCT_CACHE_DURATION);
        res.send(product)
    } else {
        let cachedProducts = cache.get('products');
        if (cachedProducts) { 
            res.send(cachedProducts);
            return 
        }

        let products = await getProductList();
        cache.put('products', products, PRODUCT_CACHE_DURATION);
        res.send(products)
        return 
    }
})




export default paymentRouter