const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');


module.exports = {
  context: __dirname + '/components',
	entry: __dirname + '/index.js',
	output: {
		path: 'public/js',
    publicPath: '/js/',
    filename: '[name].js',
		library: '[name]'
	},

	resolve: {
		modulesDirectories: ['node_modules'],
		extensions: ['', '.js']
	},

  // plugins: [
  //   new webpack.NoErrorsPlugin(),
  //   new webpack.DefinePlugin({
  //     NODE_ENV: JSON.stringify(NODE_ENV),
  //     LANG: JSON.stringify('ru')
  //   }),
  //   new webpack.optimize.CommonsChunkPlugin({
  //     name: 'common',
  //     minChunks: 2
  //   }),
  //   new webpack.LoaderOptionsPlugin({
  //     debug: true
  //   })
  //
  // ],

	module: {
		loaders: [
		  {
		    test: /\.js$/,
		    exclude: /(node_modules|bower_components)/,
		    loader: 'babel-loader',
		    query: {
		      presets: ['es2015'],
		      plugins: ['transform-runtime']
		    }
		  }
		]
	},

  devServer: {
    contentBase: 'public',
    compress: true,
    port: 9000
  },

  watch: NODE_ENV === 'development'

}
