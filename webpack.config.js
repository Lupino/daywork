const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  context: __dirname,
  devtool: 'eval',
  entry: {
    app: ['webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server',
    './app/index'],
    vendors: [
      'react',
      'react-toolbox',
      'react-router',
      'classnames',
      'history',
      'superagent'
    ] // And other vendors
  },
  output: {
    path: path.join(__dirname, 'dist/public/static'),
    filename: '[name].js',
    chunkFilename: '[id].bundle.js',
    sourceMapFilename: '{file}.map',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['', '.jsx', '.scss', '.js', '.json'],
    modulesDirectories: [
      'node_modules',
      path.resolve(__dirname, './node_modules')
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css', { allChunks: true }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loaders: ['react-hot', 'babel?presets[]=react,presets[]=es2015,presets[]=stage-0'],
        include: path.join(__dirname, 'app')
      },
      {
        test: /(\.scss|\.css)$/,
        loader: ExtractTextPlugin.extract('style', 'css?sourceMap&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!postcss!sass?sourceMap!toolbox')
      }
    ]
  },
  postcss: [autoprefixer],
  toolbox: {
    theme: path.join(__dirname, 'app/toolbox-theme.scss')
  }
};
