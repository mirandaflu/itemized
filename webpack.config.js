var webpack = require('webpack');
var HTMLWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  devtool: 'source-map',
  entry: [
    __dirname + '/app/index.js'
  ],
  resolve: {
    root: path.resolve('./'),
    alias: {
      components: path.resolve(__dirname, 'app/components'),
      pages: path.resolve(__dirname, 'app/pages')
    },
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    filename: "index_bundle.js",
    publicPath: '/'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      exclude: /\.js($|\?)/i
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new HTMLWebpackPlugin({
      template: __dirname + '/app/index.html',
      filename: 'index.html',
      inject: 'body'
    })
  ],
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loader: 'babel', presets: ['react', 'es2015'] },
      {test: /\.css$/, loaders: ['style-loader', 'css-loader']},
      {test: /\.(png|jpg|)$/, loader: 'url-loader?limit=200000'}
    ]
  }
}
