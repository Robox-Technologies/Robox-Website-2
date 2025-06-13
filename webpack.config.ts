import path from 'path';
import fs from 'fs'
import HtmlBundlerPlugin from "html-bundler-webpack-plugin"
// @ts-ignore

import MarkdownIt from 'markdown-it'

import { unified } from 'unified'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import sectionize from 'remark-sectionize'
// @ts-ignore

import { getProductList } from './build/stripehelper.js';


const storeProcessor = unified()
    .use(remarkParse)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypeRaw)
    .use(sectionize)
    .use(rehypeDocument)
    .use(rehypeFormat)
    .use(rehypeStringify)



const __dirname = path.resolve();
const cacheProducts = process.env.CACHE_MODE

//Getting all the pages in src/pages and keeping the structure
const pagesDir = path.resolve(__dirname, "src/pages");
const pagesHtmlFiles = getHtmlFiles("./src/pages", pagesDir);

//Creating all the guide pages from markdown to html
const markdownGuides = fs.readdirSync(path.resolve(__dirname, "src/guides"));
// @ts-ignore

let dynamicPages = []
createPages(markdownGuides, "src/templates/guide.html", {});
// @ts-ignore

async function processProducts(cache) {
    let productMap = {}
    let products;

    if (cache) {
        products = await getProductList()
        fs.writeFileSync("products.json", JSON.stringify(products), "utf8")
    } else {
// @ts-ignore

        products = JSON.parse(fs.readFileSync("products.json"))
    }
// @ts-ignore

    let storePages = products.map((product) => `./src/pages/shop/product/${product.internalName}.html`);
// @ts-ignore

    let storeData = storePages.map((page) => {
        let productName = path.parse(page).name;
// @ts-ignore

        let product = products.find((p) => p.internalName === productName);
        let productData = {
            product: product,
            images: []
        }
        let productImagesPath = `./src/pages/shop/product/images/${product.internalName}`;
        if (fs.existsSync(productImagesPath)) {
// @ts-ignore

            productData.images = fs.readdirSync(productImagesPath).map((file) => path.parse(file).base)
        } else {
            console.warn(`Images do not exist for ${product.name}`)
        }
// @ts-ignore

        return {[[product.internalName]]: productData};
    })
    createPages(storePages, "src/templates/product.html", Object.assign({}, ...storeData));
    return products
}

const products = await processProducts(cacheProducts);
// @ts-ignore

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
// @ts-ignore

            filename: ({ filename, chunk: { name } }) => {
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
// @ts-ignore

function getHtmlFiles(directory, rootDir) {
// @ts-ignore

    let files = [];

    fs.readdirSync(directory, { withFileTypes: true }).forEach((dirent) => {
        const fullPath = path.join(directory, dirent.name);
        if (dirent.isDirectory()) {
// @ts-ignore

            files = [...files, ...getHtmlFiles(fullPath, rootDir)];
        } 
        else if (dirent.name.endsWith(".html")) {
            const relativePath = path.relative(rootDir, fullPath); // Preserve structure after rootDir
            // @ts-ignore
            files.push({ import: fullPath, filename: relativePath });
        }
    });
// @ts-ignore

    return files;
};
// @ts-ignore

function createPages(pages, template, data) {
    for (const page of pages) {
        const pageName = path.parse(page).name; 
        const relativePath = path.relative(pagesDir, page); 
        const directoryPath = path.dirname(relativePath);
        const outputPath = path.join(directoryPath, `${pageName}.html`); 
        // @ts-ignore
        dynamicPages.push({
            "import": template,
            "filename": outputPath,
            "data": data[pageName] || {},
        });
    }
}

export default config;