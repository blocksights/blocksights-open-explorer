'use strict';

const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const git = require("git-rev-sync");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const Html = require('./html'); // html.js

module.exports = (env, args) => ({
    entry: {
        vendor: ['jquery', 'angular', 'clipboard', 'bootstrap', 'angular-route', 'angular-animate', 'angular-aria',
            'angular-ui-bootstrap', 'angular-loading-bar', 'angular-websocket', 'angular-google-analytics',
            'angular-translate', 'angular-translate-loader-static-files', 'echarts', 'angular-echarts-lite',
            'js-sha256', 'ngstorage'],
            app: "./entry.js"
    },
    output: {
        path: __dirname + "/dist",
            filename: "[name].bundle.js"
    },
    resolve: {
        fallback: {
            fs: false,
            zlib: false,
            crypto: false,
            url: false,
            http: false,
            https: false,
            stream: false,
            tls: false,
            util: false,
        }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000
    },
    
    optimization:{
        splitChunks: {
            name: 'vendor'
        }
    },
    
    target: 'web',
    
    externals: ['bufferutil', 'utf-8-validate'],
    
    plugins: [
        new webpack.ProvidePlugin({
            jdenticon: "jdenticon",
        }),
        new webpack.ProvidePlugin({
            process: "process/browser",
            $: "jquery",
            jQuery: "jquery",
            Highcharts: "highcharts",
            ClipboardJS: "clipboard"
        }),
        
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, `./node_modules/components-font-awesome/webfonts`),
                to: path.resolve(__dirname, './dist/webfonts')
            }]
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, `./app/images`),
                to: path.resolve(__dirname, './dist/images')
            }]
        }),
        
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, `./app/charting_library`),
                to: path.resolve(__dirname, './dist/charting_library')
            }]}
        ),
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, `./app/i18n`),
                to  : path.resolve(__dirname, './dist/i18n')
            }]
        }),
        new CopyWebpackPlugin({
            patterns: [{
                from: path.resolve(__dirname, `./app/favicon.ico`),
                to: path.resolve(__dirname, './dist/favicon.ico')
            }]
        }),
        new CopyWebpackPlugin({
            patterns:
                Html.map(html => {
                    return {
                        from: path.resolve(__dirname, `./app/${html}`),
                        to  : path.resolve(__dirname, './dist/html')
                    };
                })
        }),
        new HtmlWebpackPlugin({
            hash: true,
            template: __dirname + '/app/index.html',
            filename: __dirname + '/dist/index.html',
            version: args.mode === 'development' ? git.short() : args.mode === 'production' ? require("./package.json").version : 'unknown version'
        })
    ]
});
