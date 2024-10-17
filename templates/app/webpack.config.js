const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { NODE_ENV = 'development' } = process.env;

module.exports = () => {
  const isDevelopment = NODE_ENV === 'development';

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
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new CopyWebpackPlugin({
        patterns: [{ from: 'src/music/*.wav', to: 'music', flatten: true }]
      }),
      new HtmlPlugin({
        template: path.join(__dirname, 'src', 'index.html'),
        hash: true,
        inject: 'body'
      }),
      new HtmlPlugin({
        template: path.join(__dirname, 'src', 'index.html'),
        hash: true,
        inject: 'body',
        filename: 'index-cordova.html',
        scriptLoading: 'blocking',
        excludeChunks: ['vendor']
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
      }),
      isDevelopment && new webpack.HotModuleReplacementPlugin()
    ].filter(Boolean),
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '',
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: path.resolve(__dirname, 'src/app'),
          use: 'babel-loader'
        },
        {
          test: /\.hbs$/,
          use: 'handlebars-loader'
        },
        {
          test: /\.less$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
        },
        {
          test: /\.(jpg|png|svg|gif)$/,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 50000
            }
          }
        },
        {
          test: /\.(eot|ttf|woff|wav|mp3)$/,
          type: 'asset/resource'
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /jquery.mobile-/,
          use: 'mo-framework/loaders/context-window'
        }
      ]
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'vendor'
      }
    },
    devtool: isDevelopment ? 'source-map' : false,
    devServer: isDevelopment ? {
      hot: true,
      historyApiFallback: true,
      static: path.join(__dirname, 'build'),
    } : undefined
  };

  return webpackConfig;
};
