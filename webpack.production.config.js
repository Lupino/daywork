const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: './app/index',

    vendors: [
      'react',
      'react-toolbox',
      'react-router',
      'react-dropzone',
      'classnames',
      'history',
      'superagent'
    ] // And other vendors
  },
  output: {
    path: path.join(__dirname, 'build/public/static'),
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
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new ExtractTextPlugin('[name].css', { allChunks: true }),
    new webpack.optimize.UglifyJsPlugin({
      // include: /\.min\.js$|vendors.js$/,
      minimize: true
    }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loaders: ['babel?presets[]=react,presets[]=es2015,presets[]=stage-0'],
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
