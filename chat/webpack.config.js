const path = require('path');
const webpack = require('webpack');
const Visualizer = require('webpack-visualizer-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

//...


module.exports = {
    entry: [  "babel-polyfill", "./client/src/js/app.js"],
    output: {
        path: path.resolve(__dirname, "public/js"),
        filename: "bundle.js"
    },


    optimization: {
        minimize: false,
        //minimizer: [
            //new OptimizeCSSAssetsPlugin({})
        //],

        //splitChunks: {
        //    cacheGroups: {
        //        commons: {
        //            test: /[\\/]node_modules[\\/]/,
        //            name: "vendor",
        //            chunks: "initial",
        //        },
        //    },
        //    chunks: "initial",
        //},
    },

    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            //
            // both options are optional
            filename: "../css/[name].min.css",
            chunkFilename: "[id].min.css",
            sourceMap: true
        }),

        // ---------------------------------------------------------------------------------------------------------------------------
        // uncomment to generate module stats
        //new Visualizer({
        //  filename: './chat_stat.html'
        //})
    ],

    module: {
        rules:[
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [ "@babel/preset-env" ],
                            plugins: [ "@babel/plugin-proposal-class-properties" ]
                        }
                    }
                ]
            },

            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },

        ]
    },
};
