import path from 'path';
import express from 'express';
import yargs from 'yargs';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import ip from 'ip';
import webpackConfig from '../../templates/app/webpack.config'

const STAGING_PATH = path.resolve(__dirname, '../../staging/');
const DEFAULT_PORT = 7777;

export default function ({ source, port = DEFAULT_PORT }) {
    const argv = yargs.argv;

    const config = webpackConfig({ source, argv });

    const publicPath = config.output.publicPath;
    const publicPathAbsolute = path.join(source, publicPath);
    const compiler = webpack(config);
    const localIp = ip.address();

    express()
        .use(webpackDevMiddleware(compiler, {
            publicPath: publicPath, // Use the actual public path from config
            stats: { colors: true }
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
