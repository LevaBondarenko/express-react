import createSourceLoader from './createSourceLoader';

export default (options, DEBUG) => ([
  createSourceLoader({
    test: /\.jsx?$/,
    include: options.include,
    exclude: /node_modules/,
    loader: 'babel-loader',
    happy: {id: 'jsx'},
    query: {
      // https://github.com/babel/babel-loader#options
      cacheDirectory: DEBUG,

      // https://babeljs.io/docs/usage/options/
      babelrc: false,
      presets: [
        'react',
        'es2015',
        'stage-0',
      ],
      plugins: [
        'transform-decorators-legacy', // add decorator behavior like in babel 5.xx
        'add-module-exports', // add exports behavior like in babel 5.xx
        'transform-runtime',
        ...DEBUG ? [] : [
          'transform-react-remove-prop-types',
          'transform-react-constant-elements',
          //'transform-react-inline-elements',
        ],
      ],
    },
  }),
  createSourceLoader({
    happy: {id: 'txt'},
    test: /\.txt$/,
    loader: 'raw-loader',
  }),
  createSourceLoader({
    happy: {id: 'jade'},
    test: /\.jade$/,
    loader: 'jade-loader',
  }),
  {
    test: /\.json$/,
    loader: 'json-loader',
  },
  {
    test: /\.css$/,
    loader: 'style-loader/useable!css-loader!postcss-loader',
  },
  {
    test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
    loader: 'url-loader',
    query: {
      name: DEBUG ? '[path][name].[ext]?[hash]' : '[hash].[ext]',
      limit: 10000,
    },
  },
  {
    test: /\.(eot|ttf|wav|mp3)$/,
    loader: 'file-loader',
    query: {
      name: DEBUG ? '[path][name].[ext]?[hash]' : '[hash].[ext]',
    },
  },
  {
    test: /\.scss$/,
    loaders: [
      'isomorphic-style-loader',
      `css-loader?${JSON.stringify({
        sourceMap: DEBUG,
        // CSS Modules https://github.com/css-modules/css-modules
        modules: true,
        localIdentName: DEBUG ?
          '[name]_[local]_[hash:base64:3]' : '[hash:base64:4]',
        // CSS Nano http://cssnano.co/options/
        minimize: !DEBUG,
      })}`,
      'postcss-loader?parser=postcss-scss',
    ],
  },
]);
