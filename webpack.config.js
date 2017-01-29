const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  entry: {
    home: './views/components/main.js'
  },
  output: {
    path: __dirname + '/public/javascripts',
    filename: '[name].js',
    library: '[name]'
  },



resolve: {
  modulesDirectories: ['node_modules'],
  extensions: ['', 'js']
},

resolveLoader: {
  modulesDirectories: ['node_modules'],
  moduleTemplates: ['*-loader', '*'],
  extensions: ['', '.js']
},

module: {
  loaders: [{
    test: /\.jsx$/,
    loader: 'babel?optional[]=runtime'
  }]
},

  watch: NODE_ENV == 'development',
};
