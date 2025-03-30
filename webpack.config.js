import path from 'path';
import fs from 'fs'
import webpack from 'webpack';
import HtmlBundlerPlugin from "html-bundler-webpack-plugin"

const __dirname = path.resolve();


const pagesDir = path.resolve(__dirname, "src/pages");
const pagesHtmlFiles = getHtmlFiles("./src/pages", pagesDir);



const config = {
    mode: 'development',
    devtool: 'inline-source-map',
    resolve: {
        alias: {
            "@images": path.join(__dirname, 'src/_images/'),
            "@partials": path.join(__dirname, 'src/_partials/'),
            "@root": path.join(__dirname, 'src/_root/')
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new HtmlBundlerPlugin({
            entry: pagesHtmlFiles,
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.s?css$/,
                use: ['css-loader', 'sass-loader'],
            },
        ],
    },
    output: {
        clean: true
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