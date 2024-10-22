const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); 
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const HtmlIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const { NODE_ENV = 'development' } = process.env;

module.exports = () => {
    const webpackConfig = {
        entry: {
            app: ['./src/app/init'],
            vendor: [
                'jquery', 'lodash',
                'mo/jqm', 'mo/bouncefix',
                'immutable', 'vow', 'socket.io-client'
            ]
        },
        resolve: {
            extensions: ['.js'],
            modules: [
                'node_modules',
                'src/vendor',
                'src/styles',
                path.resolve(__dirname, 'src/app'),
                path.resolve(__dirname, 'node_modules')
            ],
            alias: {
                mo: 'mo-framework/modules'
            }
        },
        plugins: [
            new CleanWebpackPlugin(), // Updated to new plugin usage
            new ExtractTextPlugin("[name].css"),
            new webpack.optimize.SplitChunksPlugin({ // Replacing CommonsChunkPlugin with SplitChunksPlugin
                name: 'vendor',
                filename: 'vendor.js',
                minChunks: Infinity // Ensures vendor code is separated
            }),
            new CopyWebpackPlugin([{ from: 'src/music/*.wav', to: 'music', flatten: true }]),
            new HtmlPlugin({
                template: path.resolve(__dirname, 'src/index.html'),
                hash: true,
                inject: 'body'
            }),
            new HtmlPlugin({
                template: path.resolve(__dirname, 'src/index.html'),
                hash: true,
                inject: 'body',
                filename: 'index-cordova.html'
            }),
            new HtmlIncludeAssetsPlugin({
                files: ['index-cordova.html'],
                assets: ['cordova.js'],
                append: false
            }),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
            })
        ],
        output: {
            path: path.resolve(__dirname, 'build'),
            publicPath: '',
            filename: '[name].js'
        },
        module: {
            rules: [{
                test: /\.js$/,
                include: path.resolve(__dirname, 'src/app'),
                loader: 'babel-loader'
            }, {
                test: /\.hbs$/,
                loader: 'handlebars-loader'
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!less-loader' })
            }, {
                test: /\.(jpg|png|svg|gif)$/,
                loader: 'url-loader?limit=50000'
            }, {
                test: /\.(eot|ttf|woff|wav|mp3)$/,
                loader: 'file-loader'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            }, {
                test: /jquery.mobile-/,
                loader: 'mo-framework/loaders/context-window'
            }]
        },
        optimization: { // Add optimization settings
            splitChunks: {
                chunks: 'all',
            },
            minimize: NODE_ENV === 'production', // Enable minimization in production
            minimizer: [
                new UglifyJsPlugin({ // This replaces the optimization in Webpack 3
                    sourceMap: true
                })
            ]
        }
    };

    if (NODE_ENV === 'development') {
        webpackConfig.devtool = 'source-map';
        webpackConfig.output.pathinfo = true;
        webpackConfig.entry.vendor.push(
            'webpack-hot-middleware/client?reload=true'
        );
        webpackConfig.plugins.push(
            new webpack.HotModuleReplacementPlugin()
        );

    } else if (NODE_ENV === 'staging') {
        webpackConfig.devtool = 'source-map';
        webpackConfig.output.pathinfo = true;

    } else if (NODE_ENV === 'production') {
        webpackConfig.devtool = false;
    }

    return webpackConfig;
};
