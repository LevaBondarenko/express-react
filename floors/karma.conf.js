var DEBUG = true;

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'], // frameworks to use

    files: [
      // all files ending in 'test'
      './node_modules/phantomjs-polyfill/bind-polyfill.js',
      'test/unit.webpack.js'
      // each file acts as entry point for the webpack configuration
    ],

    preprocessors: {
      // only specify one entry point
      // and require all tests in there
      'test/unit.webpack.js': ['webpack', 'sourcemap'],
      'src/**/*.js': ['coverage']
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },

    webpack: {
      // webpack configuration
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            query: {
              presets: [
                'react',
                'es2015',
                'stage-0',
              ],
              plugins: [
                'transform-decorators-legacy', // add decorator behavior like in babel 5.xx
                'add-module-exports', // add exports behavior like in babel 5.xx
                'transform-runtime',
              ],
            },
            exclude: /node_modules/
          },
          {
            test: /\.scss$/,
            loaders: [
              'isomorphic-style-loader',
              `css-loader?${JSON.stringify({
                sourceMap: DEBUG,
                // CSS Modules https://github.com/css-modules/css-modules
                modules: true,
                localIdentName: '[local]',
                // CSS Nano http://cssnano.co/options/
                minimize: !DEBUG,
              })}`,
              'postcss-loader?parser=postcss-scss',
            ],
          },
          {test: /\.css$/, loader: 'style!css'}
        ],
        postLoaders: [{
          test: /\.js/,
          exclude: /(test|node_modules|bower_components)/,
          loader: 'istanbul-instrumenter'
        }]
      },
      externals: {
        'cheerio': 'window',
        'react/addons': true,
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },
      resolve: {
        modulesDirectories: [
          '',
          'src',
          'node_modules'
        ]
      }
    },

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      noInfo: true
    },

    plugins: [
      require('karma-webpack'),
      require('istanbul-instrumenter-loader'),
      require('karma-mocha'),
      require('karma-coverage'),
      require('karma-phantomjs-launcher'),
      require('karma-spec-reporter'),
      require('karma-sourcemap-loader')
    ],

    browsers: ['PhantomJS'],
    reportSlowerThan: 500,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true
  });
};
