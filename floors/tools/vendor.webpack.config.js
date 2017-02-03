import path from 'path';
import webpack from 'webpack';
import AssetsPlugin from 'assets-webpack-plugin';
import loaders from './webpack/loaders';
import stats from './webpack/stats';
import autoprefixer from './webpack/autoprefixer';
import createHappyPlugin from './webpack/createHappyPlugin';

const assetsPath = '../build/';

const DEBUG = !process.argv.includes('release');
const VERBOSE = process.argv.includes('verbose');

const AUTOPREFIXER_BROWSERS = autoprefixer;

const GLOBALS = {
  'process.env.NODE_ENV': DEBUG ? '"development"' : '"production"',
  __DEV__: DEBUG,
};

export default {
  context: process.cwd(),

  entry: {
    vendor: [
      'basil.js',
      'bxslider/dist/jquery.bxslider.min.js',
      'cheerio',
      'compression',
      'cors',
      'etagi-helpers',
      'classnames',
      'eventemitter3',
      'flux',
      'immutable',
      'hoist-non-react-statics',
      'jsep',
      'jsuri',
      'lodash',
      'marked',
      'moment',
      'numeral',
      'select2',
      'slick-carousel',
      'superagent',
      'swiper',
      'velocity-animate',
      'velocity-react',
      'withinviewport',
      'react',
      'react-addons-create-fragment',
      'react-addons-css-transition-group',
      'react-addons-shallow-compare',
      'react-addons-update',
      'react-bootstrap',
      'react-date-picker',
      'react-dom',
      'react-dropzone',
      'react-gemini-scrollbar',
      'react-highcharts',
      'react-paginate',
      'react-portal',
      'react-router-component',
      'react-select',
      'react-slick',
      'react-slider',
      'react-stickynode',
      'react-wildcat-prefetch',
      'fbjs',
      'react-redux',
      'redux',
      'redux-thunk',
      'redux-persist',
      'redux-persist-transform-immutable'
    ],
  },

  stats: stats(DEBUG, VERBOSE),

  devtool: DEBUG ? 'cheap-module-eval-source-map' : false,

  output: {
    path: path.join(__dirname, assetsPath, 'vendors'),
    filename: DEBUG ? '[name].dll.js' : '[name].dll.[chunkhash].js',
    chunkFilename: DEBUG ? '[name].[id].js' : '[name].[id].[chunkhash].js',
    library: '[name]'
  },
  module: {
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

  plugins: [
    // Define free variables
    // https://webpack.github.io/docs/list-of-plugins.html#defineplugin
    new webpack.DefinePlugin({...GLOBALS}),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /ru|en/),

    new webpack.optimize.DedupePlugin(),

    new webpack.optimize.OccurenceOrderPlugin(true),

    createHappyPlugin('jsx'),
    createHappyPlugin('txt'),
    createHappyPlugin('jade'),

    new webpack.DllPlugin({
      path: path.join(__dirname, assetsPath, 'vendors/[name]-manifest.json'),
      name: '[name]',
    }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        'screw_ie8': true,
        warnings: false,
      },
      comments: false,
      sourceMap: false
    }),

    new AssetsPlugin({
      path: path.resolve(__dirname, '../build/vendors'),
      filename: 'vendors.json',
      processOutput: x => {
        const localassets = process.argv.includes('localassets');

        x.vendor.js = DEBUG || localassets ? `/vendors/${x.vendor.js}` :
          `//cdn-media.etagi.com/build/vendors/${x.vendor.js}`;

        return JSON.stringify(x);
      },
    }),

    new webpack.optimize.AggressiveMergingPlugin(),

  ],
  resolve: {
    root: path.resolve(__dirname, 'client', '../../src/'),
    modulesDirectories: ['node_modules']
  }
};
