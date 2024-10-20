import path from 'path';
import express from 'express';
import yargs from 'yargs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import ip from 'ip';

const STAGING_PATH = path.resolve(__dirname, '../../staging/');
const DEFAULT_PORT = 7777;

export default function ({ source, port = DEFAULT_PORT }) {
  // Adjust how webpack config is parsed.
  const argv = yargs
    .env('dev')
    .option('mode', {
      alias: 'm',
      default: 'development',
      describe: 'Webpack mode',
      choices: ['development', 'production'],
    })
    .argv;

  // Load the Webpack configuration dynamically.
  const webpackConfig = require(path.resolve(source, 'webpack.config.js'));
  webpackConfig.mode = argv.mode;

  const compiler = webpack(webpackConfig);
  const publicPath = webpackConfig.output.publicPath || '/';
  const publicPathAbsolute = path.join(source, publicPath);
  const localIp = ip.address();

  express()
    .use(webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      stats: { colors: true },
    }))
    .use(webpackHotMiddleware(compiler))
    .use(publicPath, express.static(publicPathAbsolute))
    .use(express.static(STAGING_PATH))
    .listen(port, (err) => {
      if (err) {
        console.error(err);
      } else {
        console.log(`\n\nYour mo 🐍  server is ready. Ctrl+click => http://${localIp}:${port} !\n\n`);
      }
    });
}
