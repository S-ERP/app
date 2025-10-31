const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');

module.exports = merge(common, {
    mode: 'development',
    // devtool: 'source-map',
    // devtool: 'cheap-module-source-map',
    devtool: 'eval-cheap-module-source-map',
    cache: {
        type: "memory"
    },
    devServer: {
        port: 3010,
        // port: 3000,
        hot: true,
        historyApiFallback: true,
    },
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                use: [
                    'thread-loader',
                    {
                        loader: 'esbuild-loader',
                        options: { loader: 'tsx', target: 'es2020' },
                    },],
            },
        ],
    },
    watchOptions: {
        aggregateTimeout: 300,
        // poll: 500,
        ignored: [
            '**/node_modules/**',
            // '**/public/**',
            '**/build/**',
            '**/src/Assets/**',
            "**/android/**",
            "**/ios/**"
        ],
        // ignored: /node_modules/,
    },
    // optimization: {
    //     splitChunks: {
    //         chunks: 'all',
    //     },
    // },
});
