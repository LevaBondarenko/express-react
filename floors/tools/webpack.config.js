/**
 * o.e.kurgaev@it.etagi.com
 */

import path from 'path';
import webpack from 'webpack';
import extend from 'extend';
import AssetsPlugin from 'assets-webpack-plugin';
import loaders from './webpack/loaders';
import stats from './webpack/stats';
import autoprefixer from './webpack/autoprefixer';
import createHappyPlugin from './webpack/createHappyPlugin';

const DEBUG = !process.argv.includes('release');
const VERBOSE = process.argv.includes('verbose');

const AUTOPREFIXER_BROWSERS = autoprefixer;
const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  __DEV__: DEBUG,
};

//
// Common configuration chunk to be used for both
// client-side (app.js) and server-side (server.js) bundles
// -----------------------------------------------------------------------------

const config = {
  context: path.resolve(__dirname, '../src'),

  output: {
    path: path.resolve(__dirname, '../build/public/assets'),
    publicPath: '/assets/',
    sourcePrefix: '  ',
  },

  cache: DEBUG,
  debug: DEBUG,

  stats: stats(DEBUG, VERBOSE),

  resolve: {
    root: path.resolve(__dirname, '../src'),
    modulesDirectories: ['node_modules'],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx', '.json']
  },

  module: {
    noParse: [/build[\\\/]vendors[\\\/]*\.js$/],
    loaders: loaders({include: [path.resolve(__dirname, '../src')]}, DEBUG)
  },

  postcss(bundler) {
    return [
      require('postcss-import')({addDependencyTo: bundler}),
      require('precss')(),
      // Generate pixel fallback for "rem" units, e.g. div { margin: 2.5rem 2px 3em 100%; }
      // https://github.com/robwierzbowski/node-pixrem
      require('pixrem')(),
      // PostCSS plugin for sass-like mixins
      // https://github.com/postcss/postcss-mixins
      require('postcss-mixins')(),
      require('autoprefixer')({browsers: AUTOPREFIXER_BROWSERS}),
    ];
  },
};

//
// Configuration for the client-side bundle (app.js)
// -----------------------------------------------------------------------------

const clientConfig = extend(true, {}, config, {
  entry: {
    main: './client.js',
    mobile: './clientMobile.js'
  },

  output: {
    filename: DEBUG ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: DEBUG ? '[name].[id].js' : '[name].[id].[chunkhash].js',
  },

  target: 'web',

  // Choose a developer tool to enhance debugging
  // http://webpack.github.io/docs/configuration.html#devtool
  devtool: DEBUG ? 'eval-source-map' : false,
  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({...GLOBALS, 'process.env.BROWSER': true}),

    new webpack.DllReferencePlugin({
      context: process.cwd(),
      manifest: require('../build/vendors/vendor-manifest.json')
    }),

    createHappyPlugin('jsx'),
    createHappyPlugin('txt'),
    createHappyPlugin('jade'),
    // Assign the module and chunk ids by occurrence count
    // Consistent ordering of modules required if using any hashing ([hash] or [chunkhash])
    // https://webpack.github.io/docs/list-of-plugins.html#occurrenceorderplugin
    new webpack.optimize.OccurrenceOrderPlugin(true),

    ...(DEBUG ? [] : [
      // Search for equal or similar files and deduplicate them in the output
      // https://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
      new webpack.optimize.DedupePlugin(),

      // Minimize all JavaScript output of chunks
      // https://github.com/mishoo/UglifyJS2#compressor-options
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          'screw_ie8': true,
          warnings: VERBOSE,
        },
        comments: false,
        sourceMap: false
      }),

      // A plugin for a more aggressive chunk merging strategy
      // https://webpack.github.io/docs/list-of-plugins.html#aggressivemergingplugin
      new webpack.optimize.AggressiveMergingPlugin(),

      // Emit a file with assets paths
      // https://github.com/sporto/assets-webpack-plugin#options
      new AssetsPlugin({
        path: path.resolve(__dirname, '../build'),
        filename: 'assets.json',
        processOutput: x => {
          if(!DEBUG) {
            const localassets = process.argv.includes('localassets');

            Object.keys(x).forEach(key => {
              x[key].js = localassets ? `/public${x[key].js}` :
                `//cdn-media.etagi.com/build/public${x[key].js}`;
            });
          }
          return JSON.stringify(x);
        },
      }),
    ]),
  ],
});

//
// Configuration for the server-side bundle (server.js)
// -----------------------------------------------------------------------------

const serverConfig = extend(true, {}, config, {
  entry: './server.js',

  output: {
    path: path.resolve(__dirname, '../build'),
    filename: 'server.js',
    chunkFilename: 'server.[name].js',
    libraryTarget: 'commonjs2',
  },

  target: 'node',

  externals: [
    /^\.\/assets$/,
    /^[@a-z][a-z\/\.\-0-9]*$/i,
  ],

  node: {
    console: false,
    global: true,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },

  plugins: [

    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({...GLOBALS, 'process.env.BROWSER': false}),

    // Adds a banner to the top of each generated chunk
    // https://webpack.github.io/docs/list-of-plugins.html#bannerplugin
    new webpack.BannerPlugin('require("source-map-support").install();',
      {raw: true, entryOnly: false}),
  ],

  devtool: DEBUG ? 'eval-source-map' : false,
});

export default [clientConfig, serverConfig];
