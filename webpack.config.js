import path from 'path';
import webpack from 'webpack';
import HtmlBundlerPlugin from "html-bundler-webpack-plugin"
// in case you run into any typescript error when configuring `devServer`

const __dirname = path.resolve();

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
            entry: "src/pages/",
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

export default config;