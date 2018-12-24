const path = require('path');
const webpack = require('webpack');
var Visualizer = require('webpack-visualizer-plugin');

//...


module.exports = {
    entry: "./client/src/js/app.js",
    output: {
        path: path.resolve(__dirname, "public/js"),
        filename: "bundle.js"
    },


    optimization: {
        minimize: false,

        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendor",
                    chunks: "initial",
                },
            },
            chunks: "initial",
        },
    },

    module: {
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            }
        ]
    },



};