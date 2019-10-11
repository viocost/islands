const path = require('path');
const webpack = require('webpack');
var Visualizer = require('webpack-visualizer-plugin');



module.exports = {
    entry: path.resolve(__dirname, "client/src/js/fileWorker.js"),
    output: {
        path: path.resolve(__dirname, "public/js"),
        filename: "fileWorker.js"
    },

    optimization: {
        minimize: false,

    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                [
                                    "@babel/env",
                                    {
                                        targets: {
                                            edge: "17",
                                            firefox: "60",
                                            chrome: "67",
                                            safari: "9"
                                        },
                                        useBuiltIns: "usage"
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }

}
