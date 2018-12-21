const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: "./src/js/lib/iCrypto.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "icrypto.js"
    },


    optimization: {
        minimize: false
    },

    devtool: 'inline-source-map',


};