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
const pages = findHtmlPages(pagesDir).map((file) => {
    return {import: file, filename: file}
})

//Creating all the guide pages from markdown to html
// const markdownGuides = fs.readdirSync(path.resolve(__dirname, "src/guides"));


let dynamicPages: templatePage[] = [...pages]

// createPages(markdownGuides, "src/templates/guide.html", {});


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
    let storeData: TemplateData = storePages.reduce((acc, page) => {
        let productName = path.parse(page).name;
        let product = products.find((p) => {
            if (!p.internalName) return false
            return acc
        });
        if (!product) {
            console.warn(`Product ${productName} not found in products list.`);
            return acc;
        }
        let productData: TemplateData = {
            product: product,
            images: []
        }
        let productImagesPath = `src/pages/shop/product/images/${product.internalName}`;
        if (fs.existsSync(productImagesPath)) {
            productData.images = fs.readdirSync(productImagesPath).map((file) => path.parse(file).base)
        } else {
            console.warn(`Images do not exist for ${product.name}`)
        }
        if (!product.internalName) return acc
        acc[product.internalName] = productData
        return acc
    }, {})
    createPages(storePages, "./src/pages/shop/product/product.eta", storeData);
    return products
}
export default (async () => {
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
                entry: dynamicPages,
                js: {
                    filename: 'public/js/[name].[contenthash:8].js', // output into build/assets/js/ directory
                },
                css: {
                    filename: 'public/css/[name].[contenthash:8].css', // output into build/assets/css/ directory
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
            publicPath: '/public',
            path: path.resolve(__dirname, "build/website/"),
        }
    };
    return config;
})();

function findHtmlPages(rootDir: string): string[] {
    const result: string[] = [];

    function searchDir(currentDir: string) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                searchDir(fullPath);
            } else if (entry.isFile() && fullPath.endsWith(".html")) {
                result.push(fullPath);
            }
        }
    }
    searchDir(rootDir);
    return result;
}





function createPages(pages: string[], template: string, data: TemplateData) {
    for (const page of pages) {
        const pageName = path.parse(page).name; 
        const relativePath = path.relative(pagesDir, page); 
        const directoryPath = path.dirname(relativePath);
        const outputPath = path.join(directoryPath, `${pageName}.html`); 
        console.log(page)
        dynamicPages.push({
            "import": template,
            "filename": outputPath,
            "data": data[pageName] || {
                product: false,
                images: []
            },
        });
    }
}
