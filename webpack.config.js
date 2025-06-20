import path from 'path';
import fs from 'fs';
import HtmlBundlerPlugin from 'html-bundler-webpack-plugin';

import { unified } from 'unified';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import yumaSection from "./yumaSection.js"



const storeProcessor = unified()
    .use(yumaSection)
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeFormat)
    .use(rehypeStringify);

const __dirname = path.resolve();
const cacheProducts = process.env.CACHE_MODE === 'true';

const pagesDir = path.resolve(__dirname, 'src/pages');
const pages = findHtmlPages(pagesDir).map((file) => {
    const relative = path.relative(pagesDir, file);
    return { import: file, filename: relative };
});

let dynamicPages = [...pages];

async function processProducts(cache) {
    let products = [];
    if (cache) {
        products = await getProductList();
        fs.writeFileSync('products.json', JSON.stringify(products), 'utf8');
    } else {
        products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
    }

    const storePages = products.map(
        (product) => `./src/pages/shop/product/${product.internalName}.html`
    );

    let storeData = {};

    for (const page of storePages) {
        const productName = path.parse(page).name;
        const product = products.find((p) => p.internalName === productName);

        if (!product) {
            console.warn(`Product ${productName} not found in products list.`);
            continue;
        }

        let productData = {
            product,
            images: [],
            description: false,
        };

        const productImagesPath = `src/pages/shop/product/images/${product.internalName}`;
        if (fs.existsSync(productImagesPath)) {
            productData.images = fs.readdirSync(productImagesPath).map((file) =>
                path.parse(file).base
            );
        } else {
            console.warn(`Images do not exist for ${product.name}`);
        }

        const productDescriptionPath = `src/pages/shop/product/descriptions/${product.internalName}.md`;
        if (fs.existsSync(productDescriptionPath)) {
            const markdownDescription = fs.readFileSync(productDescriptionPath, "utf-8");
            const processed = await storeProcessor.process(markdownDescription);
            productData.description = processed.toString();
        } else {
            console.warn(`Description does not exist for ${product.name}`);
        }

        storeData[product.internalName] = productData;
    }

    createPages(storePages, './src/pages/shop/product/product.eta', storeData);

    return products;
}


export default (async () => {
    const products = await processProducts(cacheProducts);

    const config = {
        mode: 'development',
        devtool: 'source-map',
        resolve: {
            alias: {
                '@images': path.join(__dirname, 'src/images/'),
                '@partials': path.join(__dirname, 'src/partials/'),
                '@root': path.join(__dirname, 'src/root/'),
                '@types': path.join(__dirname, '@types/')
            },
            extensions: ['.tsx', '.ts', '.js', '.json']
        },
        plugins: [
            new HtmlBundlerPlugin({
                entry: dynamicPages,
                js: {
                    filename: 'public/js/[name].[contenthash:8].js'
                },
                css: {
                    filename: 'public/css/[name].[contenthash:8].css'
                },
                filename: ({ filename, chunk }) => {
                    return '[name].html';
                },
                data: {
                    products
                },
                loaderOptions: {
                    sources: [
                        {
                            tag: 'lottie-player',
                            attributes: ['src']
                        },
                        {
                            tag: 'meta',
                            attributes: ['content'],
                            filter: (tag) => {
                                return (
                                    tag.attributes.name === 'twitter:image' ||
                                    tag.attributes.property === 'og:image'
                                );
                            }
                        }
                    ]
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
                                transpileOnly: true
                            }
                        }
                    ]
                },
                {
                    test: /\.s?css$/,
                    use: ['css-loader', 'sass-loader']
                },
                {
                    test: /\.svg$/i,
                    resourceQuery: /raw/,
                    type: 'asset/source'
                },
                {
                    test: /\.svg$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'public/images/[name]-[contenthash:8].[ext]', 
                    },
                },
                {
                    test: /\.(gif|png|jpe?g|ico|webp)$/i,
                    type: 'asset/resource',
                    use: {
                        loader: 'responsive-loader',
                        options: {
                            name: 'public/images/[name]-[contenthash:8].[ext]',
                            format: "webp"
                        },
                    }
                },  
                
            ]
        },
        context: path.resolve(__dirname, '.'),
        output: {
            clean: true,
            path: path.resolve(__dirname, 'build/website/')
        }
    };

    return config;
})();

function findHtmlPages(rootDir) {
    const result = [];

    function searchDir(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                searchDir(fullPath);
            } else if (entry.isFile() && fullPath.endsWith('.html')) {
                result.push(fullPath);
            }
        }
    }

    searchDir(rootDir);
    return result;
}

function createPages(pages, template, data) {
    for (const page of pages) {
        const pageName = path.parse(page).name;
        const relativePath = path.relative(pagesDir, page);
        const directoryPath = path.dirname(relativePath);
        const outputPath = path.join(directoryPath, `${pageName}.html`);
        dynamicPages.push({
            import: template,
            filename: outputPath,
            data: data[pageName] || {
                product: false,
                images: []
            }
        });
    }
}
async function getProductList() {
    let products = await getAllStripe("product");
    let prices = await getAllStripe("price");
    let productList = [];
    for (let i = 0; i < products.length; i++) {
        const status = products[i].metadata.status ?? undefined;
        if (!isValidStatus(status)) {
            console.error(`Product ${products[i].id} does not have a valid status`);
            continue;
        }
        let displayStatus = displayStatusMap[status] ?? "Unknown Status";
        productList.push({
            name: products[i].name,
            internalName: products[i].name.replaceAll(" ", "-").replaceAll("/", "").toLowerCase(), // Use this for filenames
            description: products[i].description ?? "",
            images: products[i].images,
            price_id: prices[i].id,
            price: prices[i].unit_amount ?? 0 / 100,
            item_id: products[i].id,
            status: status,
            displayStatus: displayStatus,
        });
    }
    return productList
}
