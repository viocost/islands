const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: "./test/poc.js",
    output: {
        path: path.resolve(__dirname, "test/"),
        filename: "test.js"
    },
    target: "node"
}
