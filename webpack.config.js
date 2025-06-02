import path from 'path';
import fs from 'fs'
import HtmlBundlerPlugin from "html-bundler-webpack-plugin"
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin'

import { unified } from 'unified'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'

import { getProductList } from './stripe.js';


const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, {allowDangerousHtml: true})
  .use(rehypeRaw)
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
let guideHtmlPages = []
for (const markdownGuide of markdownGuides) {
    const guideName = path.parse(markdownGuide).name //Getting the name of the guide without the extension
    guideHtmlPages.push({
        "import": "src/templates/guide.html", //We use the guide template
        "filename": `guides/${guideName}/index.html`,
        "data": {
            markdownGuide: `src/guides/${markdownGuide}`
        }
    })
}

async function processProducts(cache) {
    let productPage = fs.readFileSync('./src/pages/shop/product/template.ejs', 'utf8');
    let productMap = {}
    let products;

    if (cache) {
        products = await getProductList()
        fs.writeFileSync("products.json", JSON.stringify(products), "utf8")
    } else {
        products = JSON.parse(fs.readFileSync("products.json"))
    }
    
    for (const product of products) {
        let filename = product.internalName
        let imageDirPath = `./src/pages/shop/product/images/${filename}`;

        fs.writeFileSync(`./src/pages/shop/product/TEMPLATE_${filename}.html`, productPage);
        if (!fs.existsSync(imageDirPath)) {
            fs.mkdirSync(imageDirPath);
            console.warn(`Images do not exist for ${product.name}`)
        }
        
        productMap[filename] = fs.readdirSync(imageDirPath).map((file) => path.parse(file).base)
    }
    fs.readdir("src/pages/shop/product/", { withFileTypes: true }, (err, files) => {
        files.forEach((file) => {
            const fullPath = path.join("src/pages/shop/product/", file.name);
            if (file.isFile() && fullPath.endsWith('.html') && fullPath.lastIndexOf('TEMPLATE') !== -1) {
                let currentProduct = fullPath.substring(fullPath.lastIndexOf("TEMPLATE_") + 9, fullPath.lastIndexOf(".html"))
                if (!productMap[currentProduct]) fs.unlinkSync(fullPath)
            }
        })
    })
    return [products, productMap];
}

let [products, productMap] = await processProducts(cacheProducts);
const htmlPages = [...guideHtmlPages, ...pagesHtmlFiles]
const config = {
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        alias: {
            "@images": path.join(__dirname, 'src/images/'),
            "@partials": path.join(__dirname, 'src/partials/'),
            "@root": path.join(__dirname, 'src/root/')
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
            filename: ({ filename, chunk: { name } }) => {
                let absolutePath = filename
                let relativePath = name
                console.log(absolutePath);
                if (absolutePath.includes("TEMPLATE_")) {
                    relativePath = relativePath.replace("TEMPLATE_", "")
                    console.log(`${relativePath}.html`);
                    return `${relativePath}.html`
                }
                if (absolutePath.includes("GUIDE_")) {
                    relativePath = relativePath.replace("GUIDE_", "")
                    return `${relativePath}.html`
                }
                // bypass the original structure
                return '[name].html';
            },
            data: {
                products,
                imageMap: productMap,
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
                beforePreprocessor: (content, { resourcePath, data }) => {
                    if (resourcePath.includes("TEMPLATE_")) {

                        //Getting the product name (the +9 is the length of TEMPLATE)
                        let currentProduct = resourcePath.substring(resourcePath.lastIndexOf("TEMPLATE_") + 9, resourcePath.lastIndexOf(".html"));
                        let descriptionPath = `src/pages/shop/product/descriptions/${currentProduct}.md`;

                        if (!fs.existsSync(descriptionPath)) {
                            console.warn(`Description does not exist for ${currentProduct}`)
                            data.description = ""
                        }
                        else {
                            processor.process(fs.readFileSync(descriptionPath, "utf-8"))
                            .then(html => {
                                data.description = String(html)
                            })
                            .catch(error => {
                                data.description = ""
                            })
                        
                        }
                        data.images = productMap[currentProduct]
                        data.product = products.filter((product) => product.internalName === currentProduct)[0]
                    }

                },
            },
            preprocessorOptions: {
                views: [
                    // path to the directory where *.md files will be searched
                    path.join(__dirname, 'src/guides/'),
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
                            configFile: 'tsconfig.webpack.json',
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
    // optimization: {
    //     minimize: true,
    //     minimizer: [
    //         new ImageMinimizerPlugin({ //The optimiser for the thumbnail photos
    //             generator: [
    //                 {
    //                     type: "asset",
    //                     implementation: ImageMinimizerPlugin.sharpGenerate,
    //                     filter: (source, sourcePath) => {
    //                         let splitSourcePath = sourcePath.split("/")
    //                         if (splitSourcePath.length < 3) return false
    //                         return splitSourcePath[splitSourcePath.length-3] === "images"
    //                     },
    //                     filename: "[path]thumb-[name][ext]",

    //                     options: {
                            
    //                         encodeOptions: {
    //                             webp: {
    //                                 quality: 100,
    //                             },
    //                         },
    //                         resize: {
    //                             enabled: true,
    //                             height: 70*2,
    //                             width: 115*2,
    //                         },
    //                     },
    //                 },
    //                 {
    //                     type: "asset",
    //                     implementation: ImageMinimizerPlugin.sharpGenerate,
    //                     filter: (source, sourcePath) => {
    //                         let splitSourcePath = sourcePath.split("/")
    //                         if (splitSourcePath.length < 3) return false
    //                         return splitSourcePath[splitSourcePath.length-3] === "images"
    //                     },
    //                     filename: "[path][name][ext]",

    //                     options: {
    //                         encodeOptions: {
    //                             webp: {
    //                                 quality: 90,
    //                             },
    //                         },
    //                     },
    //                 },
    //             ],
    //         }),
    //     ],
    // },
    output: {
        clean: true,
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        publicPath: '/'
    }
};
function getHtmlFiles(directory, rootDir) {
    let files = [];

    fs.readdirSync(directory, { withFileTypes: true }).forEach((dirent) => {
        const fullPath = path.join(directory, dirent.name);
        if (dirent.isDirectory()) {
            files = [...files, ...getHtmlFiles(fullPath, rootDir)];
        } 
        else if (dirent.name.endsWith(".html")) {
            const relativePath = path.relative(rootDir, fullPath); // Preserve structure after rootDir
            files.push({ import: fullPath, filename: relativePath });
        }
    });

    return files;
};


export default config;