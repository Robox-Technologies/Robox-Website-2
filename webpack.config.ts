import path from 'path';
import fs from 'fs'
import HtmlBundlerPlugin from "html-bundler-webpack-plugin"

import { unified } from 'unified'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import sectionize from 'remark-sectionize'


import { getProductList } from './stripe-helper';

import { Product } from './types/api';

import { templatePage, TemplateData } from './types/webpack';

const storeProcessor = unified()
    .use(remarkParse)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(sectionize)
    .use(rehypeDocument)
    .use(rehypeFormat)
    .use(rehypeStringify)



const __dirname = path.resolve();
const cacheProducts = process.env.CACHE_MODE === "true"

//Getting all the pages in src/pages and keeping the structure
const pagesDir = path.resolve(__dirname, "src/pages");


//Creating all the guide pages from markdown to html
const markdownGuides = fs.readdirSync(path.resolve(__dirname, "src/guides"));


let dynamicPages: templatePage[] = []
createPages(markdownGuides, "src/templates/guide.html", {});


async function processProducts(cache: boolean) {
    let products: Product[] = [];
    if (cache) {
        products = await getProductList()
        fs.writeFileSync("products.json", JSON.stringify(products), "utf8")
    } 
    else {
        products = JSON.parse(fs.readFileSync("products.json", "utf8"))
    }
    let storePages = products.map((product) => `./src/pages/shop/product/${product.internalName}.html`);
    let storeData: TemplateData = storePages.map((page) => {
        let productName = path.parse(page).name;
        let product = products.find((p) => {
            if (!p.internalName) return false
            return p.internalName === productName
        });
        if (!product) {
            console.warn(`Product ${productName} not found in products list.`);
            return {};
        }
        let productData: TemplateData = {
            product: product,
            images: []
        }
        let productImagesPath = `./src/pages/shop/product/images/${product.internalName}`;
        if (fs.existsSync(productImagesPath)) {
            productData.images = fs.readdirSync(productImagesPath).map((file) => path.parse(file).base)
        } else {
            console.warn(`Images do not exist for ${product.name}`)
        }
        if (!product.internalName) return
        return { [product.internalName]: productData };
    })
    createPages(storePages, "src/templates/product.html", storeData);
    return products
}

const products = await processProducts(cacheProducts);


console.log(dynamicPages)
const config = {
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        alias: {
            "@images": path.join(__dirname, 'src/images/'),
            "@partials": path.join(__dirname, 'src/partials/'),
            "@root": path.join(__dirname, 'src/root/'),
            "@types": path.join(__dirname, '@types/')
        },
        extensions: ['.tsx', '.ts', '.js', ".json"],
    },
    plugins: [
        new HtmlBundlerPlugin({
            entry: "src/pages/",//htmlPages,
            js: {
                filename: 'public/js/[name].[contenthash:8].js', // output into dist/assets/js/ directory
            },
            css: {
                filename: 'public/css/[name].[contenthash:8].css', // output into dist/assets/css/ directory
            },
            filename: ({ filename, chunk}) => {
                return '[name].html';
            },
            data: {
                products,
            },
            loaderOptions: {
                sources: [
                    {
                        tag: 'lottie-player',
                        attributes: ['src'],
                    },
                    {
                        tag: 'meta',
                        attributes: ['content'],
                        filter: (tag) => {
                            return tag.attributes.name === 'twitter:image' || tag.attributes.property === 'og:image';
                        },
                    },
                ],
            },
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            configFile: 'tsconfig.client.json',
                        },
                    },
                ],
            },
            {
                test: /\.s?css$/,
                use: ['css-loader', 'sass-loader'],
            },
            {
                test: /\.(jpe?g|png|svg|gif|mp3|json)$/i,
                type: "asset/resource",
            },
            {
                test: /\.svg$/i,
                resourceQuery: /raw/, // *.svg?raw
                type: 'asset/source',
            }
        ],
    },
    output: {
        clean: true,
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        publicPath: '/'
    }
};

function createPages(pages: string[], template: string, data: TemplateData) {
    for (const page of pages) {
        const pageName = path.parse(page).name; 
        const relativePath = path.relative(pagesDir, page); 
        const directoryPath = path.dirname(relativePath);
        const outputPath = path.join(directoryPath, `${pageName}.html`); 
        
        dynamicPages.push({
            "import": template,
            "filename": outputPath,
            "data": data[pageName] || {},
        });
    }
}

export default config;